import "server-only";

import { tmdbGet } from "@/lib/tmdb";
import type { FilterOption, FilterOptions } from "./filterConfig";
import { DEFAULT_WATCH_REGION } from "./filterConfig";

interface TmdbLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

interface TmdbCountry {
  iso_3166_1: string;
  english_name: string;
}

interface TmdbNetwork {
  id: number;
  name: string;
}

interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface TmdbGenre {
  id: number;
  name: string;
}

/**
 * Candidate network IDs for the "Network" filter. TMDB exposes no network list
 * endpoint, so we resolve each candidate through `/network/{id}` and keep only
 * the ones that exist. Names therefore always match the IDs we send to
 * `/discover/tv`, and unknown/removed candidates are silently dropped.
 */
const NETWORK_ID_CANDIDATES = [
  213, // Netflix
  49, // HBO
  4, // BBC One
  332, // BBC Two
  3, // BBC Three
  2, // ABC
  6, // NBC
  16, // CBS
  19, // FOX
  71, // The CW
  174, // AMC
  88, // FX
  67, // Showtime
  318, // Starz
  77, // Syfy
  30, // USA Network
  47, // Comedy Central
  56, // Cartoon Network
  80, // Adult Swim
  13, // Nickelodeon
  54, // Disney Channel
  14, // PBS
  453, // Hulu
  1024, // Amazon
  2552, // Apple TV+
  2739, // Disney+
];

const byName = (a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name);

async function getGenres(): Promise<FilterOption[]> {
  const data = await tmdbGet<{ genres: TmdbGenre[] }>("/genre/tv/list");
  return (data?.genres ?? []).map((genre) => ({
    id: genre.id,
    name: genre.name,
  }));
}

async function getLanguages(): Promise<FilterOption[]> {
  const data = await tmdbGet<TmdbLanguage[]>("/configuration/languages");
  return (data ?? [])
    .map((language) => ({
      id: language.iso_639_1,
      name: language.english_name || language.name,
    }))
    .filter((language) => Boolean(language.id))
    .sort(byName);
}

async function getCountries(): Promise<FilterOption[]> {
  const data = await tmdbGet<TmdbCountry[]>("/configuration/countries");
  return (data ?? [])
    .map((country) => ({
      id: country.iso_3166_1,
      name: country.english_name,
    }))
    .filter((country) => Boolean(country.id))
    .sort(byName);
}

async function getNetworks(): Promise<FilterOption[]> {
  const resolved = await Promise.all(
    NETWORK_ID_CANDIDATES.map(async (id): Promise<FilterOption | null> => {
      const network = await tmdbGet<TmdbNetwork>(`/network/${id}`);
      return network ? { id: network.id, name: network.name } : null;
    })
  );
  return resolved
    .filter((network): network is FilterOption => network !== null)
    .sort(byName);
}

async function getWatchProviders(region: string): Promise<FilterOption[]> {
  const data = await tmdbGet<{ results: TmdbProvider[] }>(
    "/watch/providers/tv",
    { params: { watch_region: region } }
  );
  return (data?.results ?? [])
    .slice()
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
    }));
}

/**
 * Load every option list the filter panel needs. Individual lists fail soft
 * (empty arrays) so one flaky TMDB call can never take down the whole page.
 */
export async function getFilterOptions(
  region: string = DEFAULT_WATCH_REGION
): Promise<FilterOptions> {
  const [genres, languages, countries, networks, watchProviders] =
    await Promise.all([
      getGenres().catch(() => []),
      getLanguages().catch(() => []),
      getCountries().catch(() => []),
      getNetworks().catch(() => []),
      getWatchProviders(region).catch(() => []),
    ]);

  return { genres, languages, countries, networks, watchProviders };
}
