"use server";
import { BASE_URL } from "@/lib/constants";
import { Episode, Series } from "@/types/seriesT";
import axios from "axios";

interface TMDBResponse {
  results: Series[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface TMDBMultiResponse {
  results: Record<string, unknown>[]; // Results can be TV, Movie, or Person
  page: number;
  total_pages: number;
  total_results: number;
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

export async function SearchMulti(query: string): Promise<TMDBMultiResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/search/multi`, {
      params: { api_key: process.env.TMDB_API_KEY, query },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch search results", { cause: error });
  }
}

export async function getTrendingSeriesBasic(): Promise<TMDBResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/trending/tv/day`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch trending series", { cause: error });
  }
}

export async function fetchAllEpisodes(
  seriesTmdbId: string,
  endSeason?: number
): Promise<Episode[] | null> {
  try {
    // Fetch series details to get number of seasons
    const seriesRes = await axios.get(`${BASE_URL}/tv/${seriesTmdbId}`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });
    const numberOfSeasons = seriesRes.data.number_of_seasons;

    // Fetch all seasons in parallel
    const seasonPromises = [];
    for (let season = 1; season <= (endSeason ?? numberOfSeasons); season++) {
      seasonPromises.push(
        axios.get(`${BASE_URL}/tv/${seriesTmdbId}/season/${season}`, {
          params: { api_key: process.env.TMDB_API_KEY },
        })
      );
    }
    const seasons = await Promise.all(seasonPromises);

    // Collect all episodes into a single array
    const allEpisodes: Episode[] = [];
    seasons.forEach((seasonRes) => {
      if (seasonRes.data.episodes) {
        allEpisodes.push(...seasonRes.data.episodes);
      }
    });

    return allEpisodes;
  } catch (error) {
    console.log("Error fetching episodes:", error);
    return null;
  }
}

export async function fetchSeasonEpisodes(
  seriesTmdbId: string,
  seasonNumber: number
): Promise<Episode[] | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/tv/${seriesTmdbId}/season/${seasonNumber}`,
      {
        params: { api_key: process.env.TMDB_API_KEY },
      }
    );
    return response.data.episodes || [];
  } catch (error) {
    console.log(`Error fetching season ${seasonNumber} episodes:`, error);
    return null;
  }
}

export async function fetchSeriesDetails(seriesTmdbId: string): Promise<Series | null> {
  try {
    const response = await axios.get(`${BASE_URL}/tv/${seriesTmdbId}`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });
    return response.data as Series;
  } catch (error) {
    console.error(`Error fetching series ${seriesTmdbId} details:`, error);
    return null;
  }
}
