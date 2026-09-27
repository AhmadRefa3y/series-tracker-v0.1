import "server-only";

import { tmdbGet } from "@/lib/tmdb";
import { Episode, Series } from "@/types/seriesT";

export async function fetchSeriesData(
  seriesId: string
): Promise<Series | null> {
  return tmdbGet<Series>(`/tv/${seriesId}`);
}

export async function fetchEpisodes(
  seriesId: string,
  numberOfSeasons: number,
  lastWatchedEpisode: { episodeNumber: number; seasonNumber: number } | null,
  watchedEpisodes: { episodeNumber: number; seasonNumber: number }[] | null
): Promise<{
  allEpisodes: Episode[];
  newEpisodes: Episode[];
} | null> {
  try {
    const seasonPromises = Array.from(
      { length: numberOfSeasons },
      async (_, index) => {
        return tmdbGet<{ episodes?: Episode[] }>(
          `/tv/${seriesId}/season/${index + 1}`
        );
      }
    );

    const seasons = await Promise.all(seasonPromises);
    const allEpisodes: Episode[] = [];

    for (const season of seasons) {
      if (season) {
        allEpisodes.push(...(season.episodes || []));
      }
    }

    const newEpisodes = allEpisodes.filter(
      (episode) =>
        !watchedEpisodes?.some(
          (watched) =>
            watched.episodeNumber === episode.episode_number &&
            watched.seasonNumber === episode.season_number
        )
    );
    return {
      newEpisodes,
      allEpisodes,
    };
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return null;
  }
}

export async function fetchSingleEpisode(
  seriesId: string,
  seasonNumber: number,
  episodeNumber: number
): Promise<Episode | null> {
  // 404s resolve to null inside tmdbGet, matching the old graceful behaviour.
  return tmdbGet<Episode>(
    `/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`
  );
}

/**
 * Resolve the next unwatched episodes after `lastWatched` — the fast batched
 * way. ONE season request returns every remaining episode of the current
 * season (tmdbGet caches it, shared with History/Calendar); only when the
 * season is exhausted does it make one more request for the next season.
 * Worst case: 2 TMDb requests instead of up to 15 single-episode calls.
 */
export async function resolveNextEpisodes(
  seriesId: string,
  lastWatched: { episodeNumber: number; seasonNumber: number } | null,
  count: number
): Promise<Episode[]> {
  const season = lastWatched?.seasonNumber ?? 1;
  const lastEpisodeNumber = lastWatched?.episodeNumber ?? 0;

  // 1 request: the full current season.
  const seasonData = await tmdbGet<{ episodes?: Episode[] }>(
    `/tv/${seriesId}/season/${season}`
  );
  const episodes = (seasonData?.episodes ?? [])
    .filter((episode) => episode.episode_number > lastEpisodeNumber)
    .slice(0, count);

  // Current season exhausted: 1 more request for the next season.
  if (episodes.length < count) {
    const nextSeason = await tmdbGet<{ episodes?: Episode[] }>(
      `/tv/${seriesId}/season/${season + 1}`
    );
    for (const episode of nextSeason?.episodes ?? []) {
      if (episodes.length >= count) break;
      episodes.push(episode);
    }
  }

  return episodes;
}
