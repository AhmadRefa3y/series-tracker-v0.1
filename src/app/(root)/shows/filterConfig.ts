/**
 * Shared filter model for the Shows discover page.
 *
 * This module is intentionally free of `server-only` and React imports so it
 * can be used by both the client filter UI and the server data layer. It is the
 * single source of truth for:
 *  - the URL parameter names,
 *  - how a `URLSearchParams` maps to a typed filter state,
 *  - how that state maps to TMDB's `/discover/tv` query parameters.
 */

export const DEFAULT_SORT = "popularity.desc";

/** Keys whose value is a comma-separated list of ids/strings. */
export const LIST_FILTER_KEYS: FilterParamKey[] = [
  "with_genres",
  "without_genres",
  "with_networks",
  "with_companies",
  "without_companies",
  "with_keywords",
  "without_keywords",
  "with_status",
  "with_type",
  "with_watch_providers",
  "with_watch_monetization_types",
];

/** Keys whose value is a boolean flag ("1" when on). */
export const TOGGLE_FILTER_KEYS: FilterParamKey[] = [
  "include_adult",
  "include_null_first_air_dates",
  "exclude_tracked",
];

/** Every query-string key the shows page understands (except `page`). */
export const FILTER_PARAM_KEYS = [
  "sort_by",
  "with_genres",
  "without_genres",
  "first_air_date.gte",
  "first_air_date.lte",
  "first_air_date_year",
  "vote_average.gte",
  "vote_average.lte",
  "vote_count.gte",
  "vote_count.lte",
  "with_runtime.gte",
  "with_runtime.lte",
  "with_original_language",
  "with_networks",
  "with_companies",
  "without_companies",
  "with_keywords",
  "without_keywords",
  "with_status",
  "with_type",
  "watch_region",
  "with_watch_providers",
  "with_watch_monetization_types",
  "include_adult",
  "include_null_first_air_dates",
  "exclude_tracked",
] as const;

export type FilterParamKey = (typeof FILTER_PARAM_KEYS)[number];

/** TMDB `/discover/tv` query parameters. Values are sent verbatim. */
export interface DiscoverTvParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  without_genres?: string;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
  first_air_date_year?: number;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "vote_count.gte"?: number;
  "vote_count.lte"?: number;
  "with_runtime.gte"?: number;
  "with_runtime.lte"?: number;
  with_original_language?: string;
  with_networks?: string;
  with_companies?: string;
  without_companies?: string;
  with_keywords?: string;
  without_keywords?: string;
  with_status?: string;
  with_type?: string;
  watch_region?: string;
  with_watch_providers?: string;
  with_watch_monetization_types?: string;
  include_adult?: boolean;
  include_null_first_air_dates?: boolean;
}

/** Typed, UI-friendly view of the current filter selection. */
export interface ShowFilterState {
  sortBy: string;
  withGenres: number[];
  withoutGenres: number[];
  firstAirDateGte: string;
  firstAirDateLte: string;
  firstAirDateYear: string;
  voteAverageGte: string;
  voteAverageLte: string;
  voteCountGte: string;
  voteCountLte: string;
  runtimeGte: string;
  runtimeLte: string;
  originalLanguage: string;
  withNetworks: number[];
  withCompanies: number[];
  withoutCompanies: number[];
  withKeywords: number[];
  withoutKeywords: number[];
  withStatus: number[];
  withType: number[];
  watchRegion: string;
  withWatchProviders: number[];
  watchMonetization: string[];
  includeAdult: boolean;
  includeNullFirstAirDates: boolean;
  excludeTracked: boolean;
}

export interface FilterOption {
  id: string | number;
  name: string;
}

/** Option lists resolved on the server and handed to the client UI. */
export interface FilterOptions {
  genres: FilterOption[];
  languages: FilterOption[];
  countries: FilterOption[];
  networks: FilterOption[];
  watchProviders: FilterOption[];
}

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "popularity.desc", label: "Popularity ↓" },
  { value: "popularity.asc", label: "Popularity ↑" },
  { value: "vote_average.desc", label: "Rating ↓" },
  { value: "vote_average.asc", label: "Rating ↑" },
  { value: "vote_count.desc", label: "Vote count ↓" },
  { value: "vote_count.asc", label: "Vote count ↑" },
  { value: "first_air_date.desc", label: "Newest first" },
  { value: "first_air_date.asc", label: "Oldest first" },
  { value: "name.asc", label: "Title A–Z" },
  { value: "name.desc", label: "Title Z–A" },
];

export const STATUS_OPTIONS = [
  { value: "0", label: "Returning Series" },
  { value: "1", label: "Planned" },
  { value: "2", label: "In Production" },
  { value: "3", label: "Ended" },
  { value: "4", label: "Cancelled" },
  { value: "5", label: "Pilot" },
];

export const TYPE_OPTIONS = [
  { value: "0", label: "Documentary" },
  { value: "1", label: "News" },
  { value: "2", label: "Miniseries" },
  { value: "3", label: "Reality" },
  { value: "4", label: "Scripted" },
  { value: "5", label: "Talk Show" },
  { value: "6", label: "Video" },
];

export const MONETIZATION_OPTIONS = [
  { value: "flatrate", label: "Streaming" },
  { value: "free", label: "Free" },
  { value: "ads", label: "With Ads" },
  { value: "rent", label: "Rent" },
  { value: "buy", label: "Buy" },
];

export const DEFAULT_WATCH_REGION = "US";

const numList = (raw: string | null): number[] =>
  (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isFinite(value));

const strList = (raw: string | null): string[] =>
  (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const str = (raw: string | null): string => (raw ?? "").trim();

const bool = (raw: string | null): boolean =>
  raw === "1" || raw === "true" || raw === "on";

/** Map the URL search params into the typed filter state. */
export function parseShowFilters(sp: URLSearchParams): ShowFilterState {
  const sort = str(sp.get("sort_by"));
  return {
    sortBy: sort || DEFAULT_SORT,
    withGenres: numList(sp.get("with_genres")),
    withoutGenres: numList(sp.get("without_genres")),
    firstAirDateGte: str(sp.get("first_air_date.gte")),
    firstAirDateLte: str(sp.get("first_air_date.lte")),
    firstAirDateYear: str(sp.get("first_air_date_year")),
    voteAverageGte: str(sp.get("vote_average.gte")),
    voteAverageLte: str(sp.get("vote_average.lte")),
    voteCountGte: str(sp.get("vote_count.gte")),
    voteCountLte: str(sp.get("vote_count.lte")),
    runtimeGte: str(sp.get("with_runtime.gte")),
    runtimeLte: str(sp.get("with_runtime.lte")),
    originalLanguage: str(sp.get("with_original_language")),
    withNetworks: numList(sp.get("with_networks")),
    withCompanies: numList(sp.get("with_companies")),
    withoutCompanies: numList(sp.get("without_companies")),
    withKeywords: numList(sp.get("with_keywords")),
    withoutKeywords: numList(sp.get("without_keywords")),
    withStatus: numList(sp.get("with_status")),
    withType: numList(sp.get("with_type")),
    watchRegion: str(sp.get("watch_region")),
    withWatchProviders: numList(sp.get("with_watch_providers")),
    watchMonetization: strList(sp.get("with_watch_monetization_types")),
    includeAdult: bool(sp.get("include_adult")),
    includeNullFirstAirDates: bool(sp.get("include_null_first_air_dates")),
    excludeTracked: bool(sp.get("exclude_tracked")),
  };
}

/** Keys that should reset pagination and/or trigger the discover endpoint. */
export function hasActiveFilters(filters: ShowFilterState): boolean {
  return (
    filters.withGenres.length > 0 ||
    filters.withoutGenres.length > 0 ||
    filters.firstAirDateGte !== "" ||
    filters.firstAirDateLte !== "" ||
    filters.firstAirDateYear !== "" ||
    filters.voteAverageGte !== "" ||
    filters.voteAverageLte !== "" ||
    filters.voteCountGte !== "" ||
    filters.voteCountLte !== "" ||
    filters.runtimeGte !== "" ||
    filters.runtimeLte !== "" ||
    filters.originalLanguage !== "" ||
    filters.withNetworks.length > 0 ||
    filters.withCompanies.length > 0 ||
    filters.withoutCompanies.length > 0 ||
    filters.withKeywords.length > 0 ||
    filters.withoutKeywords.length > 0 ||
    filters.withStatus.length > 0 ||
    filters.withType.length > 0 ||
    filters.withWatchProviders.length > 0 ||
    filters.watchMonetization.length > 0 ||
    filters.includeAdult ||
    filters.includeNullFirstAirDates ||
    filters.excludeTracked ||
    filters.sortBy !== DEFAULT_SORT
  );
}

/** Number of distinct active filter values — used for the badge/chip count. */
export function countActiveFilters(filters: ShowFilterState): number {
  return (
    filters.withGenres.length +
    filters.withoutGenres.length +
    filters.withNetworks.length +
    filters.withCompanies.length +
    filters.withoutCompanies.length +
    filters.withKeywords.length +
    filters.withoutKeywords.length +
    filters.withStatus.length +
    filters.withType.length +
    filters.withWatchProviders.length +
    filters.watchMonetization.length +
    (filters.firstAirDateGte ? 1 : 0) +
    (filters.firstAirDateLte ? 1 : 0) +
    (filters.firstAirDateYear ? 1 : 0) +
    (filters.voteAverageGte ? 1 : 0) +
    (filters.voteAverageLte ? 1 : 0) +
    (filters.voteCountGte ? 1 : 0) +
    (filters.voteCountLte ? 1 : 0) +
    (filters.runtimeGte ? 1 : 0) +
    (filters.runtimeLte ? 1 : 0) +
    (filters.originalLanguage ? 1 : 0) +
    (filters.watchRegion && filters.withWatchProviders.length > 0 ? 1 : 0) +
    (filters.includeAdult ? 1 : 0) +
    (filters.includeNullFirstAirDates ? 1 : 0) +
    (filters.excludeTracked ? 1 : 0) +
    (filters.sortBy !== DEFAULT_SORT ? 1 : 0)
  );
}

/**
 * TMDB discover treats `,` as AND and `|` as OR. Every multi-select filter in
 * the UI means "any of these", so we always join with a pipe.
 */
const join = (values: Array<string | number>) => values.join("|");

/** Convert the typed state into TMDB `/discover/tv` query parameters. */
export function toDiscoverParams(
  filters: ShowFilterState,
  page: number
): DiscoverTvParams {
  const params: DiscoverTvParams = {
    sort_by: filters.sortBy,
    page,
  };

  if (filters.withGenres.length) params.with_genres = join(filters.withGenres);
  if (filters.withoutGenres.length)
    params.without_genres = join(filters.withoutGenres);
  if (filters.firstAirDateGte)
    params["first_air_date.gte"] = filters.firstAirDateGte;
  if (filters.firstAirDateLte)
    params["first_air_date.lte"] = filters.firstAirDateLte;
  if (filters.firstAirDateYear)
    params.first_air_date_year = Number(filters.firstAirDateYear);
  if (filters.voteAverageGte)
    params["vote_average.gte"] = Number(filters.voteAverageGte);
  if (filters.voteAverageLte)
    params["vote_average.lte"] = Number(filters.voteAverageLte);
  if (filters.voteCountGte)
    params["vote_count.gte"] = Number(filters.voteCountGte);
  if (filters.voteCountLte)
    params["vote_count.lte"] = Number(filters.voteCountLte);
  if (filters.runtimeGte)
    params["with_runtime.gte"] = Number(filters.runtimeGte);
  if (filters.runtimeLte)
    params["with_runtime.lte"] = Number(filters.runtimeLte);
  if (filters.originalLanguage)
    params.with_original_language = filters.originalLanguage;
  if (filters.withNetworks.length)
    params.with_networks = join(filters.withNetworks);
  if (filters.withCompanies.length)
    params.with_companies = join(filters.withCompanies);
  if (filters.withoutCompanies.length)
    params.without_companies = join(filters.withoutCompanies);
  if (filters.withKeywords.length)
    params.with_keywords = join(filters.withKeywords);
  if (filters.withoutKeywords.length)
    params.without_keywords = join(filters.withoutKeywords);
  if (filters.withStatus.length) params.with_status = join(filters.withStatus);
  if (filters.withType.length) params.with_type = join(filters.withType);
  if (filters.withWatchProviders.length) {
    params.watch_region = filters.watchRegion || DEFAULT_WATCH_REGION;
    params.with_watch_providers = join(filters.withWatchProviders);
  }
  if (filters.watchMonetization.length)
    params.with_watch_monetization_types = join(filters.watchMonetization);
  if (filters.includeAdult) params.include_adult = true;
  if (filters.includeNullFirstAirDates)
    params.include_null_first_air_dates = true;

  // TMDB requires a minimum vote count before sorting by rating.
  if (filters.sortBy.startsWith("vote_average.") && !params["vote_count.gte"]) {
    params["vote_count.gte"] = 200;
  }

  return params;
}
