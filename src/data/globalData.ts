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

export async function fetchAllEpisodes(
  seriesTmdbId: string,
  endSeason?: number
): Promise<Episode[]> {
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
    throw new Error("Failed to fetch all episodes", { cause: error });
  }
}
