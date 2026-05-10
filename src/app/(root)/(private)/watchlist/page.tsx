// app/watchlist/page.tsx
import { WatchListSeries } from "@/types";
import SeriesData from "./_components/SeriesData";
import { fetchSingleEpisode } from "./WatchListData";
import { getCurrentUser } from "@/lib/actions/userActions";
import { getUserSeriesWatchlist } from "@/data/sharedData";
import WatchlistFilter from "./_components/WatchlistFilter";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Watchlist - Sennit",
};

export default async function Watchlist({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser("/watchlist");
  const userId = user?.id;
  
  noStore();

  const resolvedSearchParams = await searchParams;
  const statusFilter = (resolvedSearchParams.status as string) || "watching";

  let watchList: WatchListSeries[] = [];
  try {
    const seriesWatchlist = await getUserSeriesWatchlist();
    watchList = seriesWatchlist || [];
  } catch (err) {
    console.error("Failed to load watchlist:", err);
  }

  if (watchList.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center w-full text-white/50">
        <h1 className="text-3xl font-bold">Your watchlist is empty</h1>
        <p className="mt-2">Start adding some shows to track your progress!</p>
      </div>
    );
  }

  // 1. FILTER FIRST: Use database-stored fields only (NO TMDB CALLS YET)
  const filteredList = watchList.filter((series) => {
    const watchedCount = series.watchedEpisodes.length;
    let totalEpisodes = series.totalEpisodes || 0;

    if (statusFilter === "dropped") return series.status === "DROPPED";
    if (statusFilter === "plan_to_watch") return watchedCount === 0 && series.status !== "DROPPED";

    // Strict completion check: if watched matches or exceeds total, it's completed
    const isCompleted = totalEpisodes > 0 && watchedCount >= totalEpisodes;

    if (statusFilter === "completed") return isCompleted;
    if (statusFilter === "watching")
      return watchedCount > 0 && !isCompleted && series.status !== "DROPPED";

    return true;
  });

  // 2. ENRICH DATA AND SYNC MISSING METADATA
  const seriesWithData = await Promise.all(
    filteredList.map(async (series) => {
      // Background Sync for old data
      if (series.totalEpisodes === 0) {
        const { fetchSeriesDetails } = await import("@/data/globalData");
        const prisma = (await import("@/lib/prisma")).default;
        const details = await fetchSeriesDetails(series.seriesID.toString());
        if (details && userId) {
          await prisma.series.update({
            where: {
              seriesTmdbId_userId: {
                seriesTmdbId: series.seriesID.toString(),
                userId: userId,
              },
            },
            data: {
              totalEpisodes: details.number_of_episodes,
              tmdbStatus: details.status,
            },
          });
          series.totalEpisodes = details.number_of_episodes; // Update local ref for this render
        }
      }

      const lastWatched = series.watchedEpisodes[0];

      let nextEp;

      if (!lastWatched) {
        // If nothing watched, next is S1E1
        nextEp = await fetchSingleEpisode(series.seriesID.toString(), 1, 1);
      } else {
        // Simple logic: try next episode in same season
        // (Note: If this fails, the component will handle the empty state)
        nextEp = await fetchSingleEpisode(
          series.seriesID.toString(),
          lastWatched.seasonNumber,
          lastWatched.episodeNumber + 1
        );

        // If E+1 didn't exist, it might be next season E1
        if (!nextEp) {
          nextEp = await fetchSingleEpisode(
            series.seriesID.toString(),
            lastWatched.seasonNumber + 1,
            1
          );
        }
      }

      return {
        series,
        nextEpisode: nextEp ? [nextEp] : [],
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#1d1d1d] p-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-widest">
            My Watchlist
          </h1>
          <Suspense
            fallback={
              <div className="h-12 w-64 bg-white/5 animate-pulse rounded-xl" />
            }
          >
            <WatchlistFilter />
          </Suspense>
        </div>

        {seriesWithData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <h2 className="text-2xl font-bold italic uppercase tracking-tighter">
              No shows in this category
            </h2>
          </div>
        ) : (
          <div
            key={statusFilter}
            className="flex justify-center flex-wrap gap-y-4 gap-x-2"
          >
            {seriesWithData.map(({ series, nextEpisode }) => (
              <SeriesData
                key={series.seriesID}
                episodeNumber={series.currentEpisodeNumber}
                posterPath={series.seriesPoster}
                seasonNumber={series.episodeSeason}
                seriesId={series.seriesID.toString()}
                title={series.seriesTitle}
                InitWatchedEpisodes={series.watchedEpisodes.length}
                lastWatchedEpisode={series.watchedEpisodes[0]}
                seriesData={{ number_of_episodes: series.totalEpisodes } as any}
                nextEpisodes={nextEpisode}
                status={series.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
