import "server-only";

import { Series } from "@/types/seriesT";

export async function fetchSeriesData(
  seriesId: string
): Promise<Series | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${process.env.TMDB_API_KEY}`,
      { cache: "force-cache" } // Cache for static data
    );
    if (!response.ok) throw new Error("Failed to fetch series data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching series data:", error);
    return null;
  }
}

export async function fetchEpisodes(
  seriesId: string,
  numberOfSeasons: number,
  lastWatchedEpisode: { episodeNumber: number; seasonNumber: number } | null
): Promise<
  {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
    vote_average: number;
    runtime: number;
  }[]
> {
  try {
    const seasonPromises = Array.from({ length: numberOfSeasons }, (_, index) =>
      fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${
          index + 1
        }?api_key=${process.env.TMDB_API_KEY}`,
        { cache: "force-cache" }
      ).then((res) => res.json())
    );

    const seasons = await Promise.all(seasonPromises);
    const newEpisodes: {
      id: number;
      episode_number: number;
      season_number: number;
      name: string;
      overview: string;
      vote_average: number;
      runtime: number;
    }[] = [];

    for (const season of seasons) {
      newEpisodes.push(...(season.episodes || []));
    }

    return newEpisodes.filter((episode) => {
      if (!lastWatchedEpisode) return true;
      return (
        episode.season_number > lastWatchedEpisode.seasonNumber ||
        (episode.season_number === lastWatchedEpisode.seasonNumber &&
          episode.episode_number > lastWatchedEpisode.episodeNumber)
      );
    });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}
