"use server";

import { tmdbGet } from "@/lib/tmdb";
import type { FilterOption } from "./filterConfig";

interface TmdbKeyword {
  id: number;
  name: string;
}

interface TmdbCompany {
  id: number;
  name: string;
}

/** Type-ahead search for TMDB keywords (used by the keyword filters). */
export async function searchKeywords(query: string): Promise<FilterOption[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = await tmdbGet<{ results: TmdbKeyword[] }>("/search/keyword", {
    params: { query: trimmed },
  });

  return (data?.results ?? []).slice(0, 10).map((keyword) => ({
    id: keyword.id,
    name: keyword.name,
  }));
}

/** Type-ahead search for TMDB production companies. */
export async function searchCompanies(query: string): Promise<FilterOption[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = await tmdbGet<{ results: TmdbCompany[] }>("/search/company", {
    params: { query: trimmed },
  });

  return (data?.results ?? []).slice(0, 10).map((company) => ({
    id: company.id,
    name: company.name,
  }));
}
