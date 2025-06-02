"use server";
import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";

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
