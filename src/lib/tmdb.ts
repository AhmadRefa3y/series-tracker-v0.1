import "server-only";

import axios from "axios";

import { BASE_URL } from "@/lib/constants";

/**
 * Shared TMDb request layer.
 *
 * The dashboard fires many TMDb calls per render (UpNext episode batches,
 * History seasons, Calendar detail + seasons) — often for the same resources
 * and all at once, which trips TMDb's rate limiter (HTTP 429). This helper:
 *
 * 1. Caches successful GET responses for a short TTL.
 * 2. Dedupes concurrent identical requests into one.
 * 3. Retries 429s with exponential backoff, honouring the Retry-After header.
 * 4. Caps how many requests are in flight at any moment.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // Fresh enough for air-date data.
const MAX_RETRIES = 3;
const MAX_CONCURRENT = 8;

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

/** Tiny FIFO gate keeping at most MAX_CONCURRENT requests in flight. */
let active = 0;
const waiters: (() => void)[] = [];

const acquireSlot = () =>
  active < MAX_CONCURRENT
    ? (active++, Promise.resolve())
    : new Promise<void>((resolve) => waiters.push(resolve));

const releaseSlot = () => {
  const next = waiters.shift();
  if (next) {
    next(); // Hand the slot straight to the next waiter.
  } else {
    active--;
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET a TMDb endpoint with caching, dedupe and rate-limit resilience.
 * Returns the parsed `data`, or `null` for 404s and requests that keep
 * failing after retries — callers decide how to degrade.
 */
export async function tmdbGet<T>(
  path: string,
  { params = {} }: { params?: Record<string, string | number | boolean> } = {}
): Promise<T | null> {
  const url = `${BASE_URL}${path}`;
  // Stable cache key: path + sorted params (api_key included so different
  // keys can't collide, though that's theoretical).
  const search = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY ?? "",
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
  });
  search.sort(); // Stable key regardless of param insertion order.
  const cacheKey = `${url}?${search.toString()}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const pending = inFlight.get(cacheKey);
  if (pending) {
    return pending as Promise<T | null>;
  }

  const request = (async (): Promise<T | null> => {
    await acquireSlot();
    try {
      for (let attempt = 0; ; attempt++) {
        try {
          const { data } = await axios.get<T>(url, {
            params: Object.fromEntries(search),
            headers: { Accept: "application/json" },
          });
          cache.set(cacheKey, {
            expiresAt: Date.now() + CACHE_TTL_MS,
            value: data,
          });
          return data;
        } catch (error) {
          if (!axios.isAxiosError(error)) throw error;

          const status = error.response?.status;

          if (status === 404) return null; // Missing resource is not an error.

          if (status === 429 && attempt < MAX_RETRIES) {
            // Honour Retry-After when TMDb sends it (seconds), else back off.
            const retryAfter = Number(error.response?.headers?.["retry-after"]);
            const delay =
              Number.isFinite(retryAfter) && retryAfter > 0
                ? retryAfter * 1000
                : 800 * 2 ** attempt + Math.random() * 250;
            await sleep(delay);
            continue;
          }

          throw error;
        }
      }
    } catch (error) {
      console.error(`TMDb request failed: ${path}`, error);
      return null;
    } finally {
      releaseSlot();
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, request);
  return request as Promise<T | null>;
}
