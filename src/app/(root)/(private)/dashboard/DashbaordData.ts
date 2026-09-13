import { fetchSingleEpisode } from "@/app/(root)/(private)/watchlist/WatchListData";
import { auth } from "@/auth";
import { BASE_URL } from "@/lib/constants";
import prismaDb from "@/lib/prisma";
import { Episode, UpNextItem } from "@/types/seriesT";
import axios from "axios";

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
        pending = axios
          .get(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`, {
            params: { api_key: process.env.TMDB_API_KEY },
          })
          .then(
            ({ data }) =>
              new Map<number, TmdbEpisode>(
                ((data.episodes ?? []) as TmdbEpisode[]).map((episode) => [
                  episode.episode_number,
                  episode,
                ])
              )
          )
          .catch(() => new Map<number, TmdbEpisode>());
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
