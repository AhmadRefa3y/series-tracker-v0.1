import { fetchSingleEpisode } from "@/app/(root)/(private)/watchlist/WatchListData";
import { auth } from "@/auth";
import { BASE_URL } from "@/lib/constants";
import prismaDb from "@/lib/prisma";
import { Episode, UpNextItem } from "@/types/seriesT";
import axios from "axios";

type EpisodeWithDetails = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  Series: {
    seriesTmdbId: string;
    title: string;
    posterPath: string;
  };
  stillPath: string | null;
  overview: string;
  name: string;
  watchedAt: Date;
};

export const getRecentlyWatchedEpisodes = async (
  limit: number = 4
): Promise<{
  success: boolean;
  data?: EpisodeWithDetails[];
  message?: string;
  error?: unknown;
}> => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const recentEpisodes = await prismaDb.watchedEpisode.findMany({
      where: {
        userId: userId.user.id,
      },
      include: {
        Series: true,
      },
      orderBy: {
        watchedAt: "desc",
      },
      take: limit,
    });

    // Fetch episode details from TMDB for each episode
    const episodesWithPosters = await Promise.all(
      recentEpisodes.map(async (episode) => {
        try {
          const episodeResponse = await axios.get(
            `${BASE_URL}/tv/${episode.Series.seriesTmdbId}/season/${episode.seasonNumber}/episode/${episode.episodeNumber}`,
            {
              params: {
                api_key: process.env.TMDB_API_KEY,
              },
            }
          );

          const episodeData = episodeResponse.data;
          return {
            ...episode,
            stillPath: episodeData.still_path
              ? `https://image.tmdb.org/t/p/original${episodeData.still_path}`
              : null,
            overview: episodeData.overview,
            name: episodeData.name as string,
          };
        } catch {
          return {
            ...episode,
            stillPath: null,
          };
        }
      })
    );

    return {
      success: true,
      data: episodesWithPosters as EpisodeWithDetails[],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch recently watched episodes",
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
