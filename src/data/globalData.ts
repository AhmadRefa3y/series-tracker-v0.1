"use server";
import { BASE_URL } from "@/lib/constants";
import { Series } from "@/types/seriesT";
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
