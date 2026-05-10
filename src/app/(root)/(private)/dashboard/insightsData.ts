import "server-only";
import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { fetchSeriesDetails } from "@/data/globalData";

export interface UserInsights {
  totalEpisodes: number;
  totalTimeMinutes: number;
  totalSeries: number;
  completedSeries: number;
  last7DaysEpisodes: number;
  genreStats: { name: string; count: number }[];
  mostWatchedSeries: { title: string; count: number; poster: string | null; totalEpisodes: number }[];
}

interface TMDBDetails {
  id: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  number_of_episodes: number;
  status: string;
}

export async function getUserInsights(): Promise<UserInsights | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    // 1. Fetch all watched episodes with necessary series info only
    const watchedEpisodes = await prismaDb.watchedEpisode.findMany({
      where: { userId },
      select: {
        watchedAt: true,
        seriesId: true,
        Series: {
          select: {
            seriesTmdbId: true,
            title: true,
            posterPath: true,
          }
        }
      }
    });

    if (watchedEpisodes.length === 0) {
      return {
        totalEpisodes: 0,
        totalTimeMinutes: 0,
        totalSeries: 0,
        completedSeries: 0,
        last7DaysEpisodes: 0,
        genreStats: [],
        mostWatchedSeries: [],
      };
    }

    // 2. Aggregate data
    const totalEpisodes = watchedEpisodes.length;
    
    // Last 7 days activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysEpisodes = watchedEpisodes.filter(ep => new Date(ep.watchedAt) >= sevenDaysAgo).length;

    const seriesMap = new Map<string, { tmdbId: string; count: number; title: string; poster: string | null }>();
    
    watchedEpisodes.forEach((ep) => {
      const existing = seriesMap.get(ep.seriesId);
      if (existing) {
        existing.count += 1;
      } else {
        seriesMap.set(ep.seriesId, {
          tmdbId: ep.Series.seriesTmdbId,
          count: 1,
          title: ep.Series.title,
          poster: ep.Series.posterPath,
        });
      }
    });

    // 3. Fetch TMDB details for each unique series to get runtimes, genres, and total episodes
    const uniqueTmdbIds = Array.from(new Set(Array.from(seriesMap.values()).map(s => s.tmdbId)));
    const detailsPromises = uniqueTmdbIds.map(id => fetchSeriesDetails(id));
    const allDetails = await Promise.all(detailsPromises);
    
    const detailsMap = new Map<string, TMDBDetails>();
    allDetails.forEach(details => {
      if (details) detailsMap.set(details.id.toString(), details as TMDBDetails);
    });

    // 4. Calculate Time, Genres and Completion
    let totalTimeMinutes = 0;
    let completedSeries = 0;
    const genreCounts: Record<string, number> = {};

    seriesMap.forEach((stats) => {
      const details = detailsMap.get(stats.tmdbId);
      if (details) {
        // Time
        const runtime = details.episode_run_time?.[0] || 30;
        totalTimeMinutes += stats.count * runtime;

        // Genres
        details.genres?.forEach((g: { id: number; name: string }) => {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        });

        // Completion (if watched >= 95% of total episodes)
        if (stats.count >= (details.number_of_episodes * 0.95)) {
            completedSeries++;
        }
      }
    });

    // 5. Format results
    const genreStats = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const mostWatchedSeries = Array.from(seriesMap.values())
      .map(s => {
          const details = detailsMap.get(s.tmdbId);
          return { 
            title: s.title, 
            count: s.count, 
            poster: s.poster,
            totalEpisodes: details?.number_of_episodes || 0
          };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalEpisodes,
      totalTimeMinutes,
      totalSeries: seriesMap.size,
      completedSeries,
      last7DaysEpisodes,
      genreStats,
      mostWatchedSeries,
    };
  } catch (error) {
    console.error("Error generating user insights:", error);
    return null;
  }
}
