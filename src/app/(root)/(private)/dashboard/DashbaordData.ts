import {
  fetchEpisodes,
  fetchSeriesData,
} from "@/app/(root)/(private)/watchlist/WatchListData";
import { auth } from "@/auth";
import { getUserSeriesWatchlist } from "@/data/sharedData";
import { BASE_URL } from "@/lib/constants";
import prismaDb from "@/lib/prisma";
import { WatchListSeries } from "@/types";
import { Episode, Series } from "@/types/seriesT";
import axios from "axios"; // Add this import

type EpisodeWithDetails = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  Series: {
    seriesTmdbId: string;
    title: string;
    posterPath: string;
  };
  stillPath: string | null;
  overview: string;
  name: string;
  watchedAt: Date;
};

export const getRecentlyWatchedEpisodes = async (
  limit: number = 4
): Promise<{
  success: boolean;
  data?: EpisodeWithDetails[];
  message?: string;
  error?: unknown;
}> => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const recentEpisodes = await prismaDb.watchedEpisode.findMany({
      where: {
        userId: userId.user.id,
      },
      include: {
        Series: true,
      },
      orderBy: {
        watchedAt: "desc",
      },
      take: limit,
    });

    // Fetch episode details from TMDB for each episode
    const episodesWithPosters = await Promise.all(
      recentEpisodes.map(async (episode) => {
        try {
          const episodeResponse = await axios.get(
            `${BASE_URL}/tv/${episode.Series.seriesTmdbId}/season/${episode.seasonNumber}/episode/${episode.episodeNumber}`,
            {
              params: {
                api_key: process.env.TMDB_API_KEY,
              },
            }
          );

          const episodeData = episodeResponse.data;
          return {
            ...episode,
            stillPath: episodeData.still_path
              ? `https://image.tmdb.org/t/p/original${episodeData.still_path}`
              : null,
            overview: episodeData.overview,
            name: episodeData.name as string,
          };
        } catch {
          return {
            ...episode,
            stillPath: null,
          };
        }
      })
    );

    return {
      success: true,
      data: episodesWithPosters as EpisodeWithDetails[],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch recently watched episodes",
      error,
    };
  }
};

export const getUserUpNextSeries = async (
  limit: number = 6
): Promise<{
  success: boolean;
  data?: {
    series: WatchListSeries;
    seriesData: Series | null;
    episodes: {
      allEpisodes: Episode[];
      newEpisodes: Episode[];
    };
  }[];
  message?: string;
  error?: unknown;
}> => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const userSeriesWatchlist = await getUserSeriesWatchlist();

    if (!userSeriesWatchlist || userSeriesWatchlist.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const seriesDataPromises = userSeriesWatchlist.map(async (series) => {
      const seriesData = await fetchSeriesData(series.seriesID.toString());
      let episodes;
      if (seriesData) {
        episodes = await fetchEpisodes(
          series.seriesID.toString(),
          seriesData.number_of_seasons,
          series.watchedEpisodes[0] || null,
          series.watchedEpisodes
        );
        // If fetchEpisodes returns null/undefined, provide default
        if (!episodes) {
          episodes = {
            allEpisodes: [],
            newEpisodes: [],
          };
        }
      } else {
        episodes = {
          allEpisodes: [],
          newEpisodes: [],
        };
      }
      return { series, seriesData, episodes };
    });

    const seriesWithData = await Promise.all(seriesDataPromises);

    const filteredSeries = seriesWithData
      .filter(
        (item) =>
          item.seriesData &&
          item.series.watchedEpisodes.length <
            item.seriesData.number_of_episodes / 1
      )
      .slice(0, limit);
    return {
      success: true,
      data: filteredSeries,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to get user up next series",
      error,
    };
  }
};
