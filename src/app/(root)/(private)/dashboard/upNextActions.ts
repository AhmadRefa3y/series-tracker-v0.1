"use server";

import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getUpNextSeries } from "./DashbaordData";
import { getImdbIdForSeries } from "@/lib/imdb";
import type { UpNextItem } from "@/types/seriesT";

/** The payload a card needs to repaint itself after a mark/unmark. */
export type RefreshedUpNextItem = UpNextItem;

export type MarkResult =
  | { success: true; message: string; item: RefreshedUpNextItem | null }
  | { success: false; message: string };

/**
 * Mark an episode watched and return the series' refreshed Continue Watching
 * item (next episodes, counts, IMDb data) in the SAME round-trip. The card
 * applies it optimistically so the user never waits on TMDb.
 */
export const markEpisodeWatchedUpNext = async ({
  episodeData,
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
}): Promise<MarkResult> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not signed in" };
  }
  const userId = session.user.id;

  try {
    const series = await prismaDb.series.findUnique({
      where: {
        seriesTmdbId_userId: {
          userId,
          seriesTmdbId: episodeData.seriesID,
        },
      },
      select: { id: true },
    });
    if (!series) {
      return { success: false, message: "Series not found in your watchlist" };
    }

    await prismaDb.$transaction([
      prismaDb.watchedEpisode.upsert({
        where: {
          seriesId_seasonNumber_episodeNumber_userId: {
            userId,
            seriesId: series.id,
            seasonNumber: episodeData.seasonNumber,
            episodeNumber: episodeData.episodeNumber,
          },
        },
        create: {
          userId,
          seriesId: series.id,
          episodeNumber: episodeData.episodeNumber,
          seasonNumber: episodeData.seasonNumber,
        },
        update: {},
      }),
      prismaDb.series.update({
        where: { id: series.id },
        data: { latestWatchedAt: new Date() },
      }),
    ]);

    revalidatePath("/dashboard", "page");
    revalidatePath("/history", "page");

    // Refresh just this series' card data. tmdbGet's cache makes the season
    // request nearly instant; OMDb ratings are cached too.
    const result = await getUpNextSeries(8);
    const item =
      result.data?.find((entry) => entry.seriesId === episodeData.seriesID) ??
      null; // null → show is complete and left the row.

    return {
      success: true,
      message: "Episode marked as watched",
      item,
    };
  } catch (error) {
    console.error("markEpisodeWatchedUpNext error:", error);
    return { success: false, message: "Failed to mark episode" };
  }
};

/** Undo a mark from the toast — returns the refreshed item the same way. */
export const unmarkEpisodeUpNext = async ({
  episodeData,
}: {
  episodeData: {
    seriesID: string;
    episodeNumber: number;
    seasonNumber: number;
  };
}): Promise<MarkResult> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not signed in" };
  }
  const userId = session.user.id;

  try {
    const series = await prismaDb.series.findUnique({
      where: {
        seriesTmdbId_userId: {
          userId,
          seriesTmdbId: episodeData.seriesID,
        },
      },
      select: { id: true },
    });
    if (!series) {
      return { success: false, message: "Series not found in your watchlist" };
    }

    await prismaDb.watchedEpisode.deleteMany({
      where: {
        userId,
        seriesId: series.id,
        seasonNumber: episodeData.seasonNumber,
        episodeNumber: episodeData.episodeNumber,
      },
    });

    revalidatePath("/dashboard", "page");
    revalidatePath("/history", "page");

    const result = await getUpNextSeries(8);
    const item =
      result.data?.find((entry) => entry.seriesId === episodeData.seriesID) ??
      null;

    return {
      success: true,
      message: "Episode unmarked",
      item,
    };
  } catch (error) {
    console.error("unmarkEpisodeUpNext error:", error);
    return { success: false, message: "Failed to unmark episode" };
  }
};

/** Change a series' tracking status (e.g. drop it) straight from the card. */
export const setUpNextSeriesStatus = async (
  seriesId: string,
  status: "WATCHING" | "COMPLETED" | "PLAN_TO_WATCH" | "DROPPED" | "ON_HOLD"
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Not signed in" };
    }

    await prismaDb.series.update({
      where: {
        seriesTmdbId_userId: {
          userId: session.user.id,
          seriesTmdbId: seriesId,
        },
      },
      data: { status },
    });

    revalidatePath("/dashboard", "page");
    revalidatePath("/watchlist", "page");
    return { success: true, message: `Marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error("setUpNextSeriesStatus error:", error);
    return { success: false, message: "Failed to update status" };
  }
};

/** Resolve a series' IMDb ID on demand (used by the ratings link action). */
export const getUpNextImdbId = async (seriesId: string) => {
  try {
    return await getImdbIdForSeries(seriesId);
  } catch {
    return null;
  }
};
