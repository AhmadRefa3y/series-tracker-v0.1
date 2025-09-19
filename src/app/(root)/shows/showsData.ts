import "server-only";
import { TrendingSeriesT } from "@/types";
import { BASE_URL } from "@/lib/constants";

export async function getTrendingSeries(
  isLoggedIn: boolean,
  page: number = 1
): Promise<{
  results: TrendingSeriesT[];
  page: number;
  total_pages: number;
  total_results: number;
} | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&page=${page}`,
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

    if (!isLoggedIn) {
      return {
        results: data.results || [],
        page: data.page || 1,
        total_pages: data.total_pages > 500 ? 500 : data.total_pages || 1,
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
          // If we can't fetch details, return the series with 0 episodes
          console.error(
            `Error fetching details for series ${series.id}:`,
            error
          );
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
    console.error("Error fetching trending series:", error);
    return null; // Return empty array instead of throwing error
  }
}
