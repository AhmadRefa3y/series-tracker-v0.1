"use server";

import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";

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
      include: { watchedEpisodes: true },
    });
    if (!seriesExists) {
      throw new Error(
        "Series does not exist in the database. Insert it first."
      );
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
        where: {
          seriesTmdbId_userId: {
            userId: userId.user.id,
            seriesTmdbId: episodeData.seriesID,
          },
        },
        data: {
          latestWatchedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
      message: "Episode marked as watched",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to mark episode as watched",
      error: error,
    };
  }
};
