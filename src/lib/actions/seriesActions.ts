"use server";

import { Series } from "@/types/seriesT";
import { BASE_URL } from "../constants";
import prismaDb from "../prisma";

import { auth } from "@/auth";
// import { Series } from "@/types/seriesT";
// import { BASE_URL } from "../constants";

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
    console.log(series);

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

export const getMySeriesWatchlist = async () => {
  try {
    const userId = await auth();
    if (!userId?.user?.id) {
      throw new Error("User not found");
    }
    const series = await prismaDb.series.findMany({
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
    });
    console.log({ series });

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
  console.log({ seriesID });

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

export const Test = async () => {
  console.log("test");
};
