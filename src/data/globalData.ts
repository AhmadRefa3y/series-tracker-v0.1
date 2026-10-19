"use server";
import { tmdbGet } from "@/lib/tmdb";
import { Episode, Series } from "@/types/seriesT";

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
  const data = await tmdbGet<TMDBResponse>("/search/tv", {
    params: { query },
  });
  if (!data) throw new Error("Failed to fetch series details");
  return data;
}

export async function SearchMulti(query: string): Promise<TMDBMultiResponse> {
  const data = await tmdbGet<TMDBMultiResponse>("/search/multi", {
    params: { query },
  });
  if (!data) throw new Error("Failed to fetch search results");
  return data;
}

export async function getTrendingSeriesBasic(): Promise<TMDBResponse> {
  const data = await tmdbGet<TMDBResponse>("/trending/tv/day");
  if (!data) throw new Error("Failed to fetch trending series");
  return data;
}

export async function fetchAllEpisodes(
  seriesTmdbId: string,
  endSeason?: number
): Promise<Episode[] | null> {
  // Fetch series details to get number of seasons
  const series = await tmdbGet<Series>(`/tv/${seriesTmdbId}`);
  if (!series) return null;

  const lastSeason = endSeason ?? series.number_of_seasons ?? 0;
  if (lastSeason < 1) return [];

  // Fetch all seasons in parallel (tmdbGet caps concurrency and retries 429s)
  const seasons = await Promise.all(
    Array.from({ length: lastSeason }, (_, index) =>
      tmdbGet<{ episodes?: Episode[] }>(
        `/tv/${seriesTmdbId}/season/${index + 1}`
      )
    )
  );

  // Collect all episodes into a single array
  const allEpisodes: Episode[] = [];
  for (const season of seasons) {
    if (season?.episodes) {
      allEpisodes.push(...season.episodes);
    }
  }

  return allEpisodes;
}

export async function fetchSeasonEpisodes(
  seriesTmdbId: string,
  seasonNumber: number
): Promise<Episode[] | null> {
  const data = await tmdbGet<{ episodes?: Episode[] }>(
    `/tv/${seriesTmdbId}/season/${seasonNumber}`
  );
  if (!data) return null;
  return data.episodes ?? [];
}

export async function fetchSeriesDetails(
  seriesTmdbId: string
): Promise<Series | null> {
  return tmdbGet<Series>(`/tv/${seriesTmdbId}`);
}
