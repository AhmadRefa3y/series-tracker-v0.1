import "server-only";
import { BASE_URL } from "@/lib/constants";

export interface Genre {
  id: number;
  name: string;
}

export async function getTvGenres(): Promise<Genre[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/genre/tv/list?api_key=${process.env.TMDB_API_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "force-cache",
        next: { revalidate: 86400 }, // Cache for 1 day
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV genres: ${response.statusText}`);
    }

    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching TV genres:", error);
    throw new Error("Failed to load TV genres", { cause: error });
  }
}