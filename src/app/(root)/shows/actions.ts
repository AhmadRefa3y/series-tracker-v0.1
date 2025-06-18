"use server";
import { auth } from "@/auth";
import { fetchAllEpisodes } from "@/data/globalData";
import prismaDb from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    redirect("/sign-in");
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

    revalidatePath(
      `shows/${series.title.replace(/\s+/g, "_").toLowerCase()}-${series.id}`
    );
    console.log("Series removed from watchlist");

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
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
  revalaidate?: boolean;
}) => {
  const userId = await auth();
  if (!userId?.user?.id) {
    redirect("/sign-in");
  }

  try {
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
      await AddSeriesToWatchlist({ seriesData: { id: episodeData.seriesID } });
    }
    const allEpisodes = await fetchAllEpisodes(
      episodeData.seriesID,
      episodeData.seasonNumber
    );

    const previousEpisodes = allEpisodes
      .filter(
        (ep) =>
          ep.season_number < episodeData.seasonNumber ||
          (ep.season_number === episodeData.seasonNumber &&
            ep.episode_number < episodeData.episodeNumber) ||
          (ep.episode_number === episodeData.episodeNumber &&
            ep.season_number === episodeData.seasonNumber)
      )
      .map((ep) => ({
        seriesId: seriesExists.id,
        userId: userId?.user?.id as string,
        seasonNumber: ep.season_number,
        episodeNumber: ep.episode_number,
      }));

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
