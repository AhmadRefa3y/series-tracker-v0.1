import "server-only";

import axios from "axios";

/**
 * IMDb ratings layer.
 *
 * TMDb does not expose IMDb's ratings — it only maps TMDb IDs to IMDb IDs
 * (`/tv/{id}/external_ids`). The mapping plus the ratings themselves come
 * from the free OMDb API (https://www.omdbapi.com, 1,000 requests/day).
 *
 * Everything is cached aggressively: OMDb ratings change at most a few times
 * a week and the free key is rate limited. Failures degrade to null so
 * callers simply hide the IMDb badge instead of erroring.
 */

const OMDB_BASE = "https://www.omdbapi.com";
const TMDB_BASE = "https://api.themoviedb.org/3";

/** OMDb ratings rarely change — cache successful lookups for a day. */
const RATING_TTL_MS = 24 * 60 * 60 * 1000;
/** Misses are retried sooner so new episodes fill in as OMDb updates. */
const MISS_TTL_MS = 10 * 60 * 1000;
/** IMDb ID mappings are effectively static — cache for a week. */
const ID_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const ratingCache = new Map<string, { expiresAt: number; value: string | null }>();
const seasonCache = new Map<string, { expiresAt: number; value: Map<number, string> }>();
const idCache = new Map<string, { expiresAt: number; value: string | null }>();
const inFlight = new Map<string, Promise<unknown>>();

const isFresh = (entry: { expiresAt: number }) => entry.expiresAt > Date.now();

/** OMDb response shapes we care about. */
type OmdbTitle = {
  Response: string;
  Error?: string;
  imdbRating?: string;
  imdbVotes?: string;
};

type OmdbSeason = {
  Response: string;
  Episodes?: { Episode: string; imdbRating: string }[];
};

const omdbGet = async <T>(params: Record<string, string>): Promise<T | null> => {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const { data } = await axios.get<T>(OMDB_BASE, {
      params: { apikey: apiKey, r: "json", ...params },
      timeout: 8000,
    });
    if ((data as { Response?: string }).Response === "False") return null;
    return data;
  } catch {
    return null;
  }
};

/** TMDb external-ids response shape. */
type TmdbExternalIds = { imdb_id?: string | null };

/** Resolve a TMDb series ID to its IMDb ID. Cached for a week. */
export async function getImdbIdForSeries(
  tmdbId: string | number
): Promise<string | null> {
  const key = `tv:${tmdbId}`;
  const cached = idCache.get(key);
  if (cached && isFresh(cached)) return cached.value;

  const pending = inFlight.get(key) as Promise<string | null> | undefined;
  if (pending) return pending;

  const request = (async (): Promise<string | null> => {
    try {
      const { data } = await axios.get<TmdbExternalIds>(
        `${TMDB_BASE}/tv/${tmdbId}/external_ids`,
        { params: { api_key: process.env.TMDB_API_KEY }, timeout: 8000 }
      );
      return data.imdb_id ?? null;
    } catch {
      return null;
    }
  })();

  inFlight.set(key, request);
  try {
    const value = await request;
    idCache.set(key, { expiresAt: Date.now() + ID_TTL_MS, value });
    return value;
  } finally {
    inFlight.delete(key);
  }
}

/** Normalise OMDb's "N/A" to null. */
const parseRating = (rating?: string) =>
  rating && rating !== "N/A" ? rating : null;

/** Cache helper shared by the single-rating lookups. */
const cachedRating = async (
  key: string,
  fetchRating: () => Promise<string | null>
): Promise<string | null> => {
  const cached = ratingCache.get(key);
  if (cached && isFresh(cached)) return cached.value;

  const pending = inFlight.get(key) as Promise<string | null> | undefined;
  if (pending) return pending;

  const request = fetchRating();
  inFlight.set(key, request);
  try {
    const value = await request;
    ratingCache.set(key, {
      expiresAt: Date.now() + (value ? RATING_TTL_MS : MISS_TTL_MS),
      value,
    });
    return value;
  } finally {
    inFlight.delete(key);
  }
};

/** IMDb rating for a series (e.g. "8.5") by its TMDb ID. */
export async function getSeriesImdbRating(
  tmdbId: string | number
): Promise<string | null> {
  const imdbId = await getImdbIdForSeries(tmdbId);
  if (!imdbId) return null;

  return cachedRating(`rating:${imdbId}`, async () => {
    const data = await omdbGet<OmdbTitle>({ i: imdbId });
    return parseRating(data?.imdbRating);
  });
}

/**
 * IMDb rating for a single episode. OMDb resolves episodes from the series'
 * IMDb ID via Season/Episode params — one request per episode.
 */
export async function getEpisodeImdbRating(
  seriesTmdbId: string | number,
  seasonNumber: number,
  episodeNumber: number
): Promise<string | null> {
  const imdbId = await getImdbIdForSeries(seriesTmdbId);
  if (!imdbId) return null;

  return cachedRating(`rating:${imdbId}:${seasonNumber}:${episodeNumber}`, async () => {
    const data = await omdbGet<OmdbTitle>({
      i: imdbId,
      Season: String(seasonNumber),
      Episode: String(episodeNumber),
    });
    return parseRating(data?.imdbRating);
  });
}

/**
 * A whole season's IMDb ratings in one OMDb call, mapped by episode number.
 * Much cheaper than per-episode lookups when filling an episodes grid.
 */
export async function getSeasonImdbRatings(
  seriesTmdbId: string | number,
  seasonNumber: number
): Promise<Map<number, string>> {
  const imdbId = await getImdbIdForSeries(seriesTmdbId);
  if (!imdbId) return new Map();

  const key = `season:${imdbId}:${seasonNumber}`;
  const cached = seasonCache.get(key);
  if (cached && isFresh(cached)) return cached.value;

  const pending = inFlight.get(key) as Promise<Map<number, string>> | undefined;
  if (pending) return pending;

  const request = (async (): Promise<Map<number, string>> => {
    const data = await omdbGet<OmdbSeason>({ i: imdbId, Season: String(seasonNumber) });
    const map = new Map<number, string>();
    for (const episode of data?.Episodes ?? []) {
      const rating = parseRating(episode.imdbRating);
      if (episode.Episode && rating) {
        map.set(Number(episode.Episode), rating);
      }
    }
    return map;
  })();

  inFlight.set(key, request);
  try {
    const value = await request;
    seasonCache.set(key, {
      // Misses (no ratings yet) are retried sooner than hits.
      expiresAt: Date.now() + (value.size > 0 ? RATING_TTL_MS : MISS_TTL_MS),
      value,
    });
    return value;
  } finally {
    inFlight.delete(key);
  }
}
