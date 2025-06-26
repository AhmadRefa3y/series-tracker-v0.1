"use server";

import { auth } from "@/auth";
import { fetchAllEpisodes } from "@/data/globalData";
import prismaDb from "@/lib/prisma";
import { Series } from "@prisma/client";

type AddSeriesToWatchedHistoryResult = {
  success: boolean;
  message: string;
  data?: Series; // Return Series object or seriesTmdbId
};

export const addSeriesToWatchedHistory = async (
  seriesId: string,
  title: string
): Promise<AddSeriesToWatchedHistoryResult> => {
  try {
    const userId = await auth();
    if (!userId || !userId.user) {
      throw new Error("User not found");
    }
    if (!seriesId || !title) {
      throw new Error("Series ID and title are required");
    }

    const allEpisodes = await fetchAllEpisodes(seriesId);

    if (!allEpisodes || allEpisodes.length === 0) {
      throw new Error("No episodes found for this series");
    }
    const createSeries = await prismaDb.series.create({
      data: {
        title: title,
        seriesTmdbId: seriesId,
        userId: userId.user.id as string,
        watchedEpisodes: {
          createMany: {
            data: allEpisodes.map((episode) => ({
              episodeNumber: episode.episode_number,
              seasonNumber: episode.season_number,
              userId: userId.user?.id as string,
            })),
          },
        },
      },
    });
    if (!createSeries) {
      throw new Error("Failed to create series in watched history");
    }
    return {
      success: true,
      message: "Series added to watched history successfully",
      data: createSeries,
    };
  } catch (error) {
    console.log(
      "Error adding series to watched history:",
      error && typeof error === "object" ? JSON.stringify(error) : String(error)
    );
    return {
      success: false,
      message: "Error adding series to watched history",
    };
  }
};
