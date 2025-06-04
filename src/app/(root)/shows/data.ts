import "server-only";

import { BASE_URL } from "@/lib/constants";
import { TrendingSeriesT } from "@/types";

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
