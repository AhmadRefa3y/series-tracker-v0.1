import { checkEpisodeExists } from "@/lib/actions/seriesActions";
import { BASE_URL } from "@/lib/constants";
import { TrendingSeriesT } from "@/types";
import { Series } from "@/types/seriesT";
import axios from "axios";

interface TMDBResponse {
  results: Series[];
  page: number;
  total_pages: number;
  total_results: number;
}

export async function getTrendingSeries(): Promise<TrendingSeriesT[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/tv/week?api_key=${process.env.TMDB_API_KEY}`,
      {
        headers: {
          Accept: "application/json",
          "Cache-Control": "public, max-age=86400", // Cache for 1 day
        },
        cache: "force-cache", // Cache the response
        next: { revalidate: 86400 }, // Cache for 1 day
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch trending series: ${response.statusText}`
      );
    }

    const data = await response.json();

    return data.results;
  } catch (error) {
    console.error("Error fetching trending series:", error);
    throw new Error("Failed to load trending series", { cause: error });
  }
}

export async function getSeriesDetails(seriesId: string): Promise<Series> {
  try {
    const response = await axios.get(`${BASE_URL}/tv/${seriesId}`, {
      params: { api_key: process.env.TMDB_API_KEY },
      headers: {
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch series details", { cause: error });
  }
}

export async function SearchSeries(query: string): Promise<TMDBResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/search/tv`, {
      params: { api_key: process.env.TMDB_API_KEY, query },
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
