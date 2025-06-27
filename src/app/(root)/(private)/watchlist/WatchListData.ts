import "server-only";
import axios from "axios";

import { Series } from "@/types/seriesT";

export async function fetchSeriesData(
  seriesId: string
): Promise<Series | null> {
  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/tv/${seriesId}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching series data:", error);
    return null;
  }
}

export async function fetchEpisodes(
  seriesId: string,
  numberOfSeasons: number,
  lastWatchedEpisode: { episodeNumber: number; seasonNumber: number } | null,
  watchedEpisodes: { episodeNumber: number; seasonNumber: number }[] | null
): Promise<{
  allEpisodes: {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
    vote_average: number;
    runtime: number;
  }[];
  newEpisodes: {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
    vote_average: number;
    runtime: number;
  }[];
} | null> {
  try {
    const seasonPromises = Array.from(
      { length: numberOfSeasons },
      async (_, index) => {
        const { data } = await axios.get(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${index + 1}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
            },
            headers: {
              Accept: "application/json",
            },
          }
        );
        return data;
      }
    );

    const seasons = await Promise.all(seasonPromises);
    const allEpisodes: {
      id: number;
      episode_number: number;
      season_number: number;
      name: string;
      overview: string;
      vote_average: number;
      runtime: number;
    }[] = [];

    for (const season of seasons) {
      allEpisodes.push(...(season.episodes || []));
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
