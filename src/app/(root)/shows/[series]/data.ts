import "server-only";
import { BASE_URL } from "@/lib/constants";
import { Series } from "@/types/seriesT";
import axios from "axios";
import { checkEpisodeExists } from "@/lib/actions/seriesActions";

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
