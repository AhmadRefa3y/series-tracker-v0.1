"use server";

import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
