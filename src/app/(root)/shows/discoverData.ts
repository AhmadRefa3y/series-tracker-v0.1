import "server-only";
import { TrendingSeriesT } from "@/types";
import { BASE_URL } from "@/lib/constants";

export interface DiscoverTvParams {
  page?: number;
  language?: string;
  sort_by?: string;
  first_air_date_year?: number;
  "first_air_date.gte"?: string; // Format: YYYY-MM-DD
  "first_air_date.lte"?: string; // Format: YYYY-MM-DD
  with_genres?: string; // Comma separated genre IDs
  without_genres?: string; // Comma separated genre IDs
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  with_original_language?: string;
  without_keywords?: string;
  vote_count_gte?: number;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  with_networks?: string;
  with_status?: number; // 0: Returning, 1: Planned, 2: In Production, 3: Ended, 4: Cancelled, 5: Pilot
  include_null_first_air_dates?: boolean;
}

export async function discoverTvShows(
  params: DiscoverTvParams = {},
  isLoggedIn: boolean
): Promise<{
  results: TrendingSeriesT[];
  page: number;
  total_pages: number;
  total_results: number;
}> {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY || "",
      ...Object.fromEntries(
        Object.entries(params).filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, value]) => value !== undefined && value !== ""
        )
      ),
    });

    const url = `${BASE_URL}/discover/tv?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
      cache: "force-cache",
      next: { revalidate: 86400 }, // Cache for 1 day
    });

    if (!response.ok) {
      throw new Error(`Failed to discover TV shows: ${response.statusText}`);
    }

    const data = await response.json();

    if (!isLoggedIn) {
      return {
        results: data.results || [],
        page: data.page || 1,
        total_pages: data.total_pages || 1,
        total_results: data.total_results || 0,
      };
    }

    // Fetch number of episodes for each series only if logged in
    const seriesWithEpisodes = await Promise.all(
      (data.results || []).map(async (series: TrendingSeriesT) => {
        try {
          const detailsRes = await fetch(
            `${BASE_URL}/tv/${series.id}?api_key=${process.env.TMDB_API_KEY}`,
            {
              headers: {
                Accept: "application/json",
              },
              cache: "force-cache",
              next: { revalidate: 86400 },
            }
          );
          const details = await detailsRes.json();
          return {
            ...series,
            number_of_episodes: details.number_of_episodes || 0,
          };
        } catch (error) {
          console.error(
            `Error fetching details for series ${series.id}:`,
            error
          );
          // If we can't fetch details, return the series with 0 episodes
          return {
            ...series,
            number_of_episodes: 0,
          };
        }
      })
    );

    return {
      results: seriesWithEpisodes,
      page: data.page || 1,
      total_pages: data.total_pages > 500 ? 500 : data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (error) {
    console.error("Error discovering TV shows:", error);
    return {
      results: [],
      page: 1,
      total_pages: 1,
      total_results: 0,
    }; // Return empty array instead of throwing error
  }
}
