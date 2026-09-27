"use server";

import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { resolveNextEpisodes } from "./WatchListData";

/** The fresh series payload a watchlist card needs after a mark/unmark. */
export type MarkEpisodeResult = {
  success: boolean;
  message: string;
  series?: {
    seriesId: string;
    watchedCount: number;
    totalEpisodes: number;
    isCompleted: boolean;
    nextEpisodes: {
      season_number: number;
      episode_number: number;
      name?: string;
      overview?: string;
      vote_average?: number | null;
      still_path?: string | null;
      runtime?: number | null;
    }[];
  } | null;
};

/**
 * Rebuild one series' card payload after a mark/unmark: fresh watched count,
 * completion state and the next unwatched episodes (batched TMDb lookup).
 */
async function refreshWatchlistSeries(
  seriesTmdbId: string,
  userId: string,
  lastSeason: number,
  lastEpisode: number
): Promise<MarkEpisodeResult["series"]> {
  const [row] = await prismaDb.series.findMany({
    where: { seriesTmdbId: seriesTmdbId, userId },
    select: {
      totalEpisodes: true,
      status: true,
      _count: { select: { watchedEpisodes: true } },
    },
  });
  if (!row) return null;

  const watchedCount = row._count.watchedEpisodes;
  const isCompleted =
    row.totalEpisodes > 0 && watchedCount >= row.totalEpisodes;

  const nextEpisodes =
    isCompleted || row.status === "DROPPED"
      ? []
      : await resolveNextEpisodes(
          seriesTmdbId,
          { seasonNumber: lastSeason, episodeNumber: lastEpisode },
          2
        );

  return {
    seriesId: seriesTmdbId,
    watchedCount,
    totalEpisodes: row.totalEpisodes,
    isCompleted,
    nextEpisodes,
  };
}

export const markEpisodWatched = async ({
  episodeData,
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
}) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const seriesExists = await prismaDb.series.findUnique({
      where: {
        seriesTmdbId_userId: {
          userId: userId.user.id,
          seriesTmdbId: episodeData.seriesID,
        },
      },
    });

    if (!seriesExists) {
      throw new Error("Series not found in your watchlist");
    }

    // Check if episode already marked as watched to avoid duplicate key error
    const alreadyWatched = await prismaDb.watchedEpisode.findUnique({
      where: {
        seriesId_seasonNumber_episodeNumber_userId: {
          userId: userId.user.id,
          seriesId: seriesExists.id,
          seasonNumber: episodeData.seasonNumber,
          episodeNumber: episodeData.episodeNumber,
        },
      },
    });

    if (alreadyWatched) {
      return {
        success: true,
        message: "Episode already marked as watched",
      };
    }

    await prismaDb.$transaction([
      prismaDb.watchedEpisode.create({
        data: {
          userId: userId.user.id,
          seriesId: seriesExists.id,
          episodeNumber: episodeData.episodeNumber,
          seasonNumber: episodeData.seasonNumber,
        },
      }),
      prismaDb.series.update({
        where: { id: seriesExists.id },
        data: { latestWatchedAt: new Date() },
      }),
    ]);

    revalidatePath("/watchlist", "page");
    revalidatePath("/watchlist", "layout");
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Episode marked as watched",
    };
  } catch (error) {
    console.error("markEpisodWatched error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark episode",
    };
  }
};

/**
 * Mark an episode watched and return this series' refreshed progress (watched
 * count, next episodes) in the SAME round-trip so the card can advance
 * optimistically without waiting for a router refresh. tmdbGet's cache makes
 * the season request nearly instant after the first fetch.
 */
export const markEpisodeWatchedFast = async ({
  episodeData,
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
}): Promise<MarkEpisodeResult> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not signed in" };
  }
  const userId = session.user.id;

  try {
    const series = await prismaDb.series.findUnique({
      where: {
        seriesTmdbId_userId: {
          userId,
          seriesTmdbId: episodeData.seriesID,
        },
      },
      select: { id: true },
    });
    if (!series) {
      return { success: false, message: "Series not found in your watchlist" };
    }

    await prismaDb.$transaction([
      prismaDb.watchedEpisode.upsert({
        where: {
          seriesId_seasonNumber_episodeNumber_userId: {
            userId,
            seriesId: series.id,
            seasonNumber: episodeData.seasonNumber,
            episodeNumber: episodeData.episodeNumber,
          },
        },
        create: {
          userId,
          seriesId: series.id,
          episodeNumber: episodeData.episodeNumber,
          seasonNumber: episodeData.seasonNumber,
        },
        update: {},
      }),
      prismaDb.series.update({
        where: { id: series.id },
        data: { latestWatchedAt: new Date() },
      }),
    ]);

    revalidatePath("/watchlist", "page");
    revalidatePath("/dashboard", "page");

    // Refresh this series' card data (counts + next episodes) now.
    const fresh = await refreshWatchlistSeries(
      episodeData.seriesID,
      userId,
      episodeData.seasonNumber,
      episodeData.episodeNumber
    );

    return {
      success: true,
      message: "Episode marked as watched",
      series: fresh,
    };
  } catch (error) {
    console.error("markEpisodeWatchedFast error:", error);
    return { success: false, message: "Failed to mark episode" };
  }
};

/**
 * Undo a mark. When `episode` is omitted, the series' most recently watched
 * episode is resolved server-side (robust at season boundaries).
 * Same return shape as markEpisodeWatchedFast.
 */
export const unmarkEpisodeWatchedFast = async ({
  seriesID,
  episode,
}: {
  seriesID: string;
  episode?: {
    episodeNumber: number;
    seasonNumber: number;
  };
}): Promise<MarkEpisodeResult> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not signed in" };
  }
  const userId = session.user.id;

  try {
    const series = await prismaDb.series.findUnique({
      where: {
        seriesTmdbId_userId: {
          userId,
          seriesTmdbId: seriesID,
        },
      },
      select: { id: true },
    });
    if (!series) {
      return { success: false, message: "Series not found in your watchlist" };
    }

    let deletedSeason: number;
    let deletedEpisode: number;

    if (episode) {
      deletedSeason = episode.seasonNumber;
      deletedEpisode = episode.episodeNumber;
      await prismaDb.watchedEpisode.deleteMany({
        where: {
          userId,
          seriesId: series.id,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber,
        },
      });
    } else {
      // Resolve the latest watched episode (highest season, then episode).
      const latest = await prismaDb.watchedEpisode.findFirst({
        where: { userId, seriesId: series.id },
        orderBy: [{ seasonNumber: "desc" }, { episodeNumber: "desc" }],
        select: { seasonNumber: true, episodeNumber: true },
      });
      if (!latest) {
        return { success: false, message: "Nothing watched yet to undo" };
      }
      await prismaDb.watchedEpisode.delete({
        where: {
          seriesId_seasonNumber_episodeNumber_userId: {
            userId,
            seriesId: series.id,
            seasonNumber: latest.seasonNumber,
            episodeNumber: latest.episodeNumber,
          },
        },
      });
      deletedSeason = latest.seasonNumber;
      deletedEpisode = latest.episodeNumber;
    }

    revalidatePath("/watchlist", "page");
    revalidatePath("/dashboard", "page");

    const fresh = await refreshWatchlistSeries(
      seriesID,
      userId,
      deletedSeason,
      deletedEpisode - 1
    );

    return {
      success: true,
      message: "Episode unmarked",
      series: fresh,
    };
  } catch (error) {
    console.error("unmarkEpisodeWatchedFast error:", error);
    return { success: false, message: "Failed to unmark episode" };
  }
};

export const updateSeriesStatus = async (seriesId: string, status: string) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) throw new Error("Unauthorized");

    await prismaDb.series.update({
      where: {
        seriesTmdbId_userId: {
          seriesTmdbId: seriesId,
          userId: userId.user.id,
        },
      },
      data: { status },
    });

    revalidatePath("/watchlist", "page");
    revalidatePath("/watchlist", "layout");
    revalidatePath("/", "layout");
    return { success: true, message: `Status updated to ${status}` };
  } catch (error) {
    console.error("updateSeriesStatus error:", error, { seriesId, status });
    return { success: false, message: "Failed to update status" };
  }
};
