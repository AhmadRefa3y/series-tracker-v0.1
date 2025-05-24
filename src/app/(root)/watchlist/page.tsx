"use client";
import { getMySeriesWatchlist } from "@/lib/actions/seriesActions";
import React, { useEffect, useState } from "react";
import { WatchListSeries } from "@/types";
import { RefreshCcw } from "lucide-react";
import SeriesData from "./_components/seriesCard";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Watchlist = () => {
  // const session = useSession();
  const [watchList, setWatchList] = useState<WatchListSeries[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("rerender");

  useEffect(() => {
    // if (session.status === "unauthenticated") {
    //   redirect("/sign-in");
    // }

    // if (session.status === "authenticated") {
    const getWatchList = async () => {
      try {
        setLoading(true);
        const seriesWatchlist = await getMySeriesWatchlist();

        if (!seriesWatchlist) {
          setWatchList([]);
          return;
        }

        setWatchList(
          seriesWatchlist.map((series) => ({
            seriesID: Number(series.seriesTmdbId),
            currentEpisodeNumber:
              series.watchedEpisodes[0]?.episodeNumber + 1 || 1,
            episodeSeason: series.watchedEpisodes[0]?.seasonNumber || 1,
            seriesPoster: series.posterPath || "",
            seriesTitle: series.title,
            watchedEpisodes: series.watchedEpisodes,
            lastWatchedEpisode: series.latestWatchedAt,
            posterPath: series.posterPath || "",
            title: series.title,
          }))
        );
      } catch (err) {
        setError("Failed to load watchlist");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getWatchList();
    // }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <RefreshCcw className="animate-spin" size={100} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">{error}</h1>
      </div>
    );
  }

  if (!watchList || watchList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
      </div>
    );
  }

  return (
    <div className="flex justify-start flex-wrap p-4 w-full gap-y-2">
      {watchList.map((series) => (
        <SeriesData
          key={series.seriesID}
          episodeNumber={series.currentEpisodeNumber}
          posterPath={series.seriesPoster}
          seasonNumber={series.episodeSeason}
          seriesId={series.seriesID.toString()}
          title={series.seriesTitle}
          InitWatchedEpisodes={series.watchedEpisodes.length}
          lastWatchedEpisode={series.watchedEpisodes[0]}
        />
      ))}
    </div>
  );
};

export default Watchlist;
