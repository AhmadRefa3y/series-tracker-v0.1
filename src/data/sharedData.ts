import "server-only";
import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { WatchListSeries } from "@/types";

export const getUserSeriesWatchlist = async (
  limit?: number
): Promise<WatchListSeries[] | null> => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const findSeries = await prismaDb.series.findMany({
      where: {
        userId: userId?.user?.id,
      },
      include: {
        watchedEpisodes: {
          orderBy: [
            { seasonNumber: "desc" },
            { episodeNumber: "desc" }, // If seasons are the same, get the highest episode number
          ],
          select: {
            episodeNumber: true,
            seasonNumber: true,
          },
        },
      },
      orderBy: {
        latestWatchedAt: "desc",
      },
      take: limit || undefined,
    });

    const series = findSeries.map((series) => {
      return {
        seriesID: Number(series.seriesTmdbId),
        currentEpisodeNumber: series.watchedEpisodes[0]?.episodeNumber + 1 || 1,
        episodeSeason: series.watchedEpisodes[0]?.seasonNumber || 1,
        seriesPoster: series.posterPath || "",
        seriesTitle: series.title,
        watchedEpisodes: series.watchedEpisodes,
        lastWatchedEpisode: series.latestWatchedAt,
        posterPath: series.posterPath || "",
        title: series.title,
        status: series.status,
        totalEpisodes: series.totalEpisodes,
        tmdbStatus: series.tmdbStatus,
      };
    });

    return series;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const IsSeriesTracked = async ({ seriesID }: { seriesID: string }) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const series = await prismaDb.series.findFirst({
      where: {
        seriesTmdbId: seriesID,
        userId: userId?.user?.id,
      },
      include: {
        watchedEpisodes: true,
      },
    });

    return series;
  } catch {
    return null;
  }
};
