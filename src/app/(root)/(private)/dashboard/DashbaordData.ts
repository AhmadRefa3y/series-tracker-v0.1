import { auth } from "@/auth";
import { BASE_URL } from "@/lib/constants";
import prismaDb from "@/lib/prisma";

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
