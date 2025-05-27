"use server";

import { Series } from "@/types/seriesT";
import { BASE_URL } from "../constants";
import prismaDb from "../prisma";

import { auth } from "@/auth";
import { WatchListSeries } from "@/types";

export const AddSeriesToWatchlist = async ({
  seriesData,
}: {
  seriesData: {
    id: string;
    title: string;
    poster: string;
  };
}) => {
  const userId = await auth();
  if (!userId?.user?.id) {
    console.log("User not authenticated, returning error response.");
    return {
      success: false,
      message: "User not authenticated. Please sign in.",
      errorType: "AUTH_REQUIRED", // Optional: a custom error type
    };
  }

  try {
    await prismaDb.series.create({
      data: {
        seriesTmdbId: seriesData.id,
        title: seriesData.title,
        userId: userId.user.id,
        posterPath: seriesData.poster,
      },
    });

    return {
      success: true,
      message: "Series added to watchlist",
    };
  } catch (error) {
    console.error("Failed to add series to watchlist:", error); // Log the actual error
    return {
      success: false,
      message: "Failed to add series to watchlist. Please try again.",
    };
  }
};

export const IsSeriesTracked = async ({ seriesID }: { seriesID: string }) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const series = await prismaDb.series.findFirst({
      where: {
        seriesTmdbId: seriesID,
        userId: userId?.user?.id,
      },
      include: {
        watchedEpisodes: true,
      },
    });

    return series;
  } catch {
    return null;
  }
};

export const setEpisodWatched = async ({
  episodeData,
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
}) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const seriesResponse = await fetch(
      `${BASE_URL}/tv/${episodeData.seriesID}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits`,
      {
        cache: "force-cache",
      }
    );

    if (!seriesResponse.ok) {
      throw new Error(`Failed to fetch series: ${seriesResponse.statusText}`);
    }

    const seriesData: Series = await seriesResponse.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const previousEpisodes: any[] = [];
    const seriesExists = await prismaDb.series.findUnique({
      where: {
        seriesTmdbId_userId: {
          userId: userId.user.id,
          seriesTmdbId: episodeData.seriesID,
        },
      },
      include: { watchedEpisodes: true },
    });
    if (!seriesExists) {
      throw new Error(
        "Series does not exist in the database. Insert it first."
      );
    }
    // Loop through each season
    seriesData.seasons.forEach((season) => {
      if (
        season.season_number > 0 &&
        season.season_number <= episodeData.seasonNumber
      ) {
        const isCurrentSeason =
          season.season_number === episodeData.seasonNumber;

        for (let index = 1; index <= season.episode_count; index++) {
          if (isCurrentSeason && index > episodeData.episodeNumber) {
            break; // Stop at the selected episode in the current season
          }

          previousEpisodes.push({
            seasonNumber: season.season_number,
            episodeNumber: index,
            seriesId: seriesExists?.id,
            userId: userId.user?.id,
          });
        }
      }
    });

    const filteredEpisodes = previousEpisodes.filter(
      (episode) =>
        !seriesExists.watchedEpisodes.some(
          (watched) =>
            watched.episodeNumber === episode.episodeNumber &&
            watched.seasonNumber === episode.seasonNumber
        )
    );

    await prismaDb.$transaction([
      prismaDb.watchedEpisode.createMany({
        data: filteredEpisodes,
      }),
      prismaDb.series.update({
        where: {
          seriesTmdbId_userId: {
            userId: userId.user.id,
            seriesTmdbId: episodeData.seriesID,
          },
        },
        data: {
          latestWatchedAt: new Date(),
        },
      }),
    ]);
    return {
      success: true,
      message: "Series added to add episode to watchlist",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add series to watchlist",
      error: error,
    };
  }
};

export const getMySeriesWatchlist = async (
  limit?: number
): Promise<WatchListSeries[] | null> => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const findSeries = await prismaDb.series.findMany({
      where: {
        userId: userId?.user?.id,
      },
      include: {
        watchedEpisodes: {
          orderBy: [
            { seasonNumber: "desc" },
            { episodeNumber: "desc" }, // If seasons are the same, get the highest episode number
          ],
        },
      },
      orderBy: {
        latestWatchedAt: "desc",
      },
      take: limit || undefined,
    });

    const series = findSeries.map((series) => {
      return {
        seriesID: Number(series.seriesTmdbId),
        currentEpisodeNumber: series.watchedEpisodes[0]?.episodeNumber + 1 || 1,
        episodeSeason: series.watchedEpisodes[0]?.seasonNumber || 1,
        seriesPoster: series.posterPath || "",
        seriesTitle: series.title,
        watchedEpisodes: series.watchedEpisodes,
        lastWatchedEpisode: series.latestWatchedAt,
        posterPath: series.posterPath || "",
        title: series.title,
      };
    });

    return series;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const checkSeriesExists = async (seriesID: string) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const series = await prismaDb.series.findFirst({
      where: {
        seriesTmdbId: seriesID,
        userId: userId?.user?.id,
      },
    });

    if (series) {
      return {
        success: true,
        data: series,
      };
    } else {
      return {
        success: false,
        data: null,
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
    };
  }
};

export const removeSeriesFromWatchlist = async (seriesID: string) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const series = await prismaDb.series.findFirst({
      where: {
        seriesTmdbId: seriesID,
        userId: userId?.user?.id,
      },
    });

    if (!series) {
      throw new Error("Series not found");
    }
    await prismaDb.series.delete({
      where: {
        id: series.id,
      },
    });
    return {
      success: true,
      message: "Series removed from watchlist",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to remove series from watchlist",
    };
  }
};

export const checkEpisodeExists = async (episodeData: {
  seriesID: string;
  episodeNumber: number;
  seasonNumber: number;
}) => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }

    const series = await prismaDb.series.findFirst({
      where: {
        seriesTmdbId: episodeData.seriesID,
        userId: userId.user.id,
      },
    });

    if (!series) {
      throw new Error("Series not found");
    }
    const episode = await prismaDb.watchedEpisode.findFirst({
      where: {
        episodeNumber: episodeData.episodeNumber,
        seasonNumber: episodeData.seasonNumber,
        seriesId: series.id,
        userId: userId?.user?.id,
      },
    });

    if (episode) {
      return {
        success: true,
        data: episode,
      };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    return { success: false, data: null, error: error };
  }
};

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
        const episodeResponse = await fetch(
          `${BASE_URL}/tv/${episode.Series.seriesTmdbId}/season/${episode.seasonNumber}/episode/${episode.episodeNumber}?api_key=${process.env.TMDB_API_KEY}`,
          { cache: "force-cache" }
        );

        if (!episodeResponse.ok) {
          return {
            ...episode,
            stillPath: null,
          };
        }

        const episodeData = await episodeResponse.json();
        return {
          ...episode,
          stillPath: episodeData.still_path
            ? `https://image.tmdb.org/t/p/original${episodeData.still_path}`
            : null,
          overview: episodeData.overview,
          name: episodeData.name as string,
        };
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
