"use server";
import { auth } from "@/auth";
import { BASE_URL } from "@/lib/constants";
import prismaDb from "@/lib/prisma";
import { Series } from "@/types/seriesT";
import { revalidatePath } from "next/cache";

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

export const setEpisodWatched = async ({
  episodeData,
  revalaidate = true,
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
  revalaidate?: boolean;
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
    if (revalaidate) {
      revalidatePath(
        `/shows/${`${seriesExists.title}-${episodeData.seriesID}`}`
      );
    }
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
