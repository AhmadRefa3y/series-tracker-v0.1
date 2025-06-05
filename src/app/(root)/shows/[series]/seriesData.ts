import "server-only";
import { BASE_URL } from "@/lib/constants";
import { Series } from "@/types/seriesT";
import axios from "axios";
import prismaDb from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSeriesDetails(seriesId: string): Promise<Series> {
  try {
    const response = await axios.get(`${BASE_URL}/tv/${seriesId}`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch series details", { cause: error });
  }
}

export async function getEpisodeDataWithWatchStatus(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number
) {
  try {
    const response = await axios.get(
      `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
      {
        params: { api_key: process.env.TMDB_API_KEY },
      }
    );

    const episodeData = response.data;

    const watchStatus = await checkEpisodeExists({
      episodeNumber: episodeNumber,
      seasonNumber: seasonNumber,
      seriesID: seriesId.toString(),
    });

    return {
      episodeData,
      isWatched: watchStatus.success,
    };
  } catch (error) {
    console.error("Error fetching episode data:", error);
    return {
      episodeData: null,
      isWatched: false,
      error: "Failed to load episode data",
    };
  }
}

export const checkEpisodeExists = async (episodeData: {
  seriesID: string;
  episodeNumber: number;
  seasonNumber: number;
}) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const series = await prismaDb.series.findFirst({
      where: {
        seriesTmdbId: episodeData.seriesID,
        userId: userId.user.id,
      },
    });

    if (!series) {
      throw new Error("Series not found");
    }
    const episode = await prismaDb.watchedEpisode.findFirst({
      where: {
        episodeNumber: episodeData.episodeNumber,
        seasonNumber: episodeData.seasonNumber,
        seriesId: series.id,
        userId: userId?.user?.id,
      },
    });

    if (episode) {
      return {
        success: true,
        data: episode,
      };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    return { success: false, data: null, error: error };
  }
};
