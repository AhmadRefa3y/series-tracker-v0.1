"use client";
import { getMySeriesWatchlist } from "@/lib/actions/seriesActions";
import React, { useEffect, useState } from "react";
import { WatchListSeries } from "@/types";
import { RefreshCcw } from "lucide-react";
import SeriesData from "../../watchlist/_components/SeriesData";

const UpNext = () => {
  const [watchList, setWatchList] = useState<WatchListSeries[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWatchList = async () => {
      try {
        setLoading(true);
        const seriesWatchlist = await getMySeriesWatchlist(4);

        if (!seriesWatchlist) {
          setWatchList([]);
          return;
        }

        setWatchList(seriesWatchlist);
      } catch (err) {
        setError("Failed to load watchlist");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getWatchList();
  }, []);

  if (loading) {
    return (
      <div className="flex  items-center justify-center w-full  text-white h-[260px] mt-3 py-4">
        <RefreshCcw className="animate-spin" size={100} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[260px] items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">{error}</h1>
      </div>
    );
  }

  if (!watchList || watchList.length === 0) {
    return (
      <div className="flex h-[292px] items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center mt-3 w-full gap-y-2 py-4">
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

export default UpNext;
