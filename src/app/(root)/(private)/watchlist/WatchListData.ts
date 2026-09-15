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
