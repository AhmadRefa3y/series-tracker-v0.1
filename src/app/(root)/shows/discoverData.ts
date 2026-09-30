import "server-only";

import { tmdbGet } from "@/lib/tmdb";
import { TrendingSeriesT } from "@/types";
import type { DiscoverTvParams } from "./filterConfig";

export interface DiscoverTvResult {
  results: TrendingSeriesT[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface DiscoverResponse {
  results?: TrendingSeriesT[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

/** Drop empty values so we never send blank query params to TMDB. */
function cleanParams(
  params: DiscoverTvParams
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as Record<string, string | number | boolean>;
}

export async function discoverTvShows(
  params: DiscoverTvParams = {},
  isLoggedIn: boolean
): Promise<DiscoverTvResult> {
  const data = await tmdbGet<DiscoverResponse>("/discover/tv", {
    params: cleanParams(params),
  });

  if (!data) {
    return { results: [], page: 1, total_pages: 1, total_results: 0 };
  }

  const totalPages = data.total_pages ?? 1;

  if (!isLoggedIn) {
    return {
      results: data.results ?? [],
      page: data.page ?? 1,
      total_pages: totalPages > 500 ? 500 : totalPages,
      total_results: data.total_results ?? 0,
    };
  }

  // Number of episodes powers the "finished" and progress states on each card.
  const results = await Promise.all(
    (data.results ?? []).map(async (series) => {
      const details = await tmdbGet<{ number_of_episodes?: number }>(
        `/tv/${series.id}`
      );
      return {
        ...series,
        number_of_episodes: details?.number_of_episodes ?? 0,
      };
    })
  );

  return {
    results,
    page: data.page ?? 1,
    total_pages: totalPages > 500 ? 500 : totalPages,
    total_results: data.total_results ?? 0,
  };
}
