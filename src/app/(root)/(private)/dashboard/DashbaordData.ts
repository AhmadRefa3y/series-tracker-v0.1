import { fetchSingleEpisode } from "@/app/(root)/(private)/watchlist/WatchListData";
import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { tmdbGet } from "@/lib/tmdb";
import { Episode, UpNextItem, UpcomingEpisodeItem } from "@/types/seriesT";

export type WatchHistoryItem = {
  id: string;
  watchedAt: Date;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  stillUrl: string | null;
  posterUrl: string | null;
  runtime: number | null;
  voteAverage: number | null;
  seriesTmdbId: string;
  seriesTitle: string;
};

type TmdbEpisode = {
  episode_number: number;
  name?: string;
  overview?: string;
  still_path?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
};

const STILL_BASE = "https://image.tmdb.org/t/p/w780";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

/** Some records store a bare TMDb path, others a full URL. */
const withImageBase = (base: string, path?: string | null) =>
  path ? (path.startsWith("http") ? path : `${base}${path}`) : null;

/**
 * Watched episodes, newest first. Backs both the dashboard carousel (a small
 * slice) and the `/history` page (paged).
 */
export const getWatchHistory = async ({
  limit = 12,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<{
  success: boolean;
  data?: WatchHistoryItem[];
  total?: number;
  message?: string;
  error?: unknown;
}> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not found");
    }

    const where = { userId: session.user.id };

    const [episodes, total] = await Promise.all([
      prismaDb.watchedEpisode.findMany({
        where,
        include: { Series: true },
        orderBy: { watchedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prismaDb.watchedEpisode.count({ where }),
    ]);

    // Seasons are cached per request, so a page of history costs one TMDb call
    // per distinct season instead of one call per episode.
    const seasonCache = new Map<string, Promise<Map<number, TmdbEpisode>>>();

    const loadSeason = (seriesId: string, seasonNumber: number) => {
      const key = `${seriesId}:${seasonNumber}`;
      let pending = seasonCache.get(key);
      if (!pending) {
        pending = tmdbGet<{ episodes?: TmdbEpisode[] }>(
        `/tv/${seriesId}/season/${seasonNumber}`
      ).then(
        (data) =>
          new Map<number, TmdbEpisode>(
            (data?.episodes ?? []).map((episode) => [
              episode.episode_number,
              episode,
            ])
          )
      );
        seasonCache.set(key, pending);
      }
      return pending;
    };

    const data = await Promise.all(
      episodes.map(async (episode): Promise<WatchHistoryItem> => {
        const entry: WatchHistoryItem = {
          id: episode.id,
          watchedAt: episode.watchedAt,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber,
          name: "",
          overview: "",
          stillUrl: null,
          posterUrl: withImageBase(POSTER_BASE, episode.Series.posterPath),
          runtime: null,
          voteAverage: null,
          seriesTmdbId: episode.Series.seriesTmdbId,
          seriesTitle: episode.Series.title,
        };

        const season = await loadSeason(
          episode.Series.seriesTmdbId,
          episode.seasonNumber
        );
        const details = season.get(episode.episodeNumber);

        if (!details) return entry;

        return {
          ...entry,
          name: details.name ?? "",
          overview: details.overview ?? "",
          stillUrl: withImageBase(STILL_BASE, details.still_path),
          runtime: details.runtime ?? null,
          voteAverage: details.vote_average ?? null,
        };
      })
    );

    return { success: true, data, total };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch watch history",
      error,
    };
  }
};

/* ------------------------------------------------------------------ */
/* Calendar: upcoming (scheduled) episodes of tracked series          */
/* ------------------------------------------------------------------ */

/**
 * Today's date as a YYYY-MM-DD string in the server's local timezone. TMDb air
 * dates are calendar days with no timezone, so comparing against local "today"
 * (instead of UTC) keeps an episode airing today in the list.
 */
const localToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const toUpcomingItem = (
  series: { seriesTmdbId: string; title: string; posterPath: string | null },
  episode: Episode
): UpcomingEpisodeItem => ({
  seriesId: series.seriesTmdbId,
  title: series.title,
  posterUrl: withImageBase(POSTER_BASE, series.posterPath),
  seasonNumber: episode.season_number,
  episodeNumber: episode.episode_number,
  name: episode.name ?? "",
  overview: episode.overview ?? "",
  stillUrl: withImageBase(STILL_BASE, episode.still_path),
  runtime: episode.runtime ?? null,
  voteAverage: episode.vote_average ?? null,
  airDate: episode.air_date,
});

/**
 * Minimal shape of TMDb's `/tv/{id}` detail response for this feature.
 */
type TmdbSeriesStatus = {
  /** Season currently airing, e.g. 34 for Raw. null when between seasons. */
  next_episode_to_air: { season_number: number; episode_number: number } | null;
  /** Most recently aired episode — anchors us when nothing is scheduled yet. */
  last_episode_to_air: { season_number: number; episode_number: number } | null;
  /** Also hints at the following season when one is announced. */
  seasons?: { season_number: number }[];
};

/**
 * The next scheduled episode (air_date >= today) for each series in the
 * user's watchlist, sorted by air date. One episode per series keeps the
 * calendar a compact "what's up next" row instead of dumping a show's whole
 * remaining season. Only DROPPED series are excluded; ended/cancelled shows
 * simply yield nothing because all their episodes have aired.
 *
 * TMDb's `next_episode_to_air` points at the season that is airing RIGHT NOW
 * (season 34 of Raw, not season 1), so we fetch that season directly instead
 * of probing from season 1 upward — long-running shows previously fell out of
 * the 3-empty-seasons stop rule before ever reaching their live season.
 */
export const getUpcomingEpisodes = async (
  limit = 30
): Promise<{
  success: boolean;
  data?: UpcomingEpisodeItem[];
  message?: string;
  error?: unknown;
}> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not found");
    }

    // Only dropped series are excluded — everything else in the watchlist is
    // a calendar candidate. (tmdbStatus is NOT filtered in SQL: NULL values
    // would silently fail a NOT IN clause and hide unsynced series.)
    const series = await prismaDb.series.findMany({
      where: {
        userId: session.user.id,
        status: { not: "DROPPED" },
      },
      select: {
        seriesTmdbId: true,
        title: true,
        posterPath: true,
      },
    });

    if (series.length === 0) {
      return { success: true, data: [] };
    }

    // One TMDb season request per distinct series:season. Full season bodies
    // come with every episode's air date, so this is the cheapest route to
    // "everything that hasn't aired yet".
    const seasonCache = new Map<string, Promise<Episode[]>>();
    const loadSeason = (seriesId: string, seasonNumber: number) => {
      const key = `${seriesId}:${seasonNumber}`;
      let pending = seasonCache.get(key);
      if (!pending) {
        pending = tmdbGet<{ episodes?: Episode[] }>(
          `/tv/${seriesId}/season/${seasonNumber}`
        ).then((data) => data?.episodes ?? []);
        seasonCache.set(key, pending);
      }
      return pending;
    };

    const today = localToday();

    const seriesEpisodes = await Promise.all(
      series.map(async (item) => {
        // One detail call per series tells us where each show is live.
        const status = await tmdbGet<TmdbSeriesStatus>(
          `/tv/${item.seriesTmdbId}`
        );
        if (!status) {
          return []; // Series detail unavailable; skip rather than guess.
        }

        // Prefer the season that's airing now; fall back to the one that last
        // aired (covers between-seasons gaps), plus any newly announced season.
        const anchor =
          status.next_episode_to_air?.season_number ??
          status.last_episode_to_air?.season_number;
        if (!anchor) return [];

        // +1 covers shows that just wrapped a season while the next is
        // announced; the loadSeason miss-guard skips seasons that don't exist.
        const seasonNumbers = [
          ...new Set([anchor, anchor + 1, anchor + 2]),
        ];

        const upcoming: UpcomingEpisodeItem[] = [];
        const seasons = await Promise.all(
          seasonNumbers.map((seasonNumber) =>
            loadSeason(item.seriesTmdbId, seasonNumber)
          )
        );

        for (const episodes of seasons) {
          for (const episode of episodes) {
            if (episode.air_date && episode.air_date >= today) {
              upcoming.push(toUpcomingItem(item, episode));
            }
          }
        }

        // One card per series: just its soonest scheduled episode.
        return upcoming
          .sort((a, b) => a.airDate.localeCompare(b.airDate))
          .slice(0, 1);
      })
    );

    const data = seriesEpisodes
      .flat()
      .sort((a, b) => a.airDate.localeCompare(b.airDate))
      .slice(0, limit);

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch upcoming episodes",
      error,
    };
  }
};

/**
 * Resolves the next unwatched episodes after `lastWatched`.
 *
 * Instead of downloading every season of a series, this only asks TMDb for a
 * small batch of upcoming coordinates and jumps to the next season when it
 * hits a finale. In the common case a series costs a single round-trip.
 */
async function resolveNextEpisodes(
  seriesId: string,
  lastWatched: { episodeNumber: number; seasonNumber: number } | null,
  count: number
): Promise<Episode[]> {
  const episodes: Episode[] = [];
  let season = lastWatched?.seasonNumber ?? 1;
  let episodeNumber = lastWatched?.episodeNumber ?? 0;
  let emptySeasons = 0;

  for (let attempt = 0; attempt < 5 && episodes.length < count; attempt++) {
    const batch = await Promise.all(
      Array.from({ length: 3 }, (_, offset) =>
        fetchSingleEpisode(seriesId, season, episodeNumber + offset + 1)
      )
    );

    const found = batch.filter((episode): episode is Episode => episode !== null);

    if (found.length === 0) {
      // End of the season: try the next one, and give up once two in a row are
      // empty so a fully caught-up series doesn't keep hitting TMDb.
      if (++emptySeasons >= 2) break;
      season += 1;
      episodeNumber = 0;
      continue;
    }

    emptySeasons = 0;
    episodes.push(...found);
    const last = found[found.length - 1];
    season = last.season_number;
    episodeNumber = last.episode_number;
  }

  return episodes.slice(0, count);
}

export const getUpNextSeries = async (
  limit: number = 8
): Promise<{
  success: boolean;
  data?: UpNextItem[];
  message?: string;
  error?: unknown;
}> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not found");
    }

    // One lean query: the latest watched episode and its count per series is all
    // we need to filter out completed shows before hitting TMDb.
    const series = await prismaDb.series.findMany({
      where: {
        userId: session.user.id,
        status: { not: "DROPPED" },
      },
      include: {
        watchedEpisodes: {
          orderBy: [{ seasonNumber: "desc" }, { episodeNumber: "desc" }],
          take: 1,
          select: { seasonNumber: true, episodeNumber: true },
        },
        _count: { select: { watchedEpisodes: true } },
      },
      // Freshest activity first. Marking an episode updates this timestamp, so
      // the client freezes the row order to stop cards jumping mid-interaction.
      orderBy: [{ latestWatchedAt: "desc" }, { id: "desc" }],
    });

    const candidates = series
      .filter((item) => item._count.watchedEpisodes > 0)
      .filter(
        (item) =>
          item.totalEpisodes === 0 ||
          item._count.watchedEpisodes < item.totalEpisodes
      )
      .slice(0, limit);

    if (candidates.length === 0) {
      return { success: true, data: [] };
    }

    const items = await Promise.all(
      candidates.map(async (item) => {
        const nextEpisodes = await resolveNextEpisodes(
          item.seriesTmdbId,
          item.watchedEpisodes[0] ?? null,
          2
        );

        return {
          seriesId: item.seriesTmdbId,
          title: item.title,
          posterPath: item.posterPath,
          totalEpisodes: item.totalEpisodes,
          watchedCount: item._count.watchedEpisodes,
          nextEpisodes,
        } satisfies UpNextItem;
      })
    );

    return {
      success: true,
      data: items.filter((item) => item.nextEpisodes.length > 0),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to get up next series",
      error,
    };
  }
};
