"use client";

import { getMySeriesWatchlist } from "@/lib/actions/seriesActions";
import { useEffect, useState } from "react";
import { WatchListSeries } from "@/types";
import { RefreshCcw, StepForward } from "lucide-react";
import { cn } from "@/lib/utils";
import SeriesData from "@/components/SeriesData";

// Extracted components for better organization
const SectionHeader = ({
  title,
  loading,
}: {
  title: string;
  loading: boolean;
}) => (
  <div className="flex gap-1 text-xl items-center mt-4">
    <StepForward width={40} height={40} />
    {title}
    {loading && <RefreshCcw className="animate-spin ms-2" size={30} />}
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex h-[260px] items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
    <h1 className="text-3xl font-bold">{message}</h1>
  </div>
);

const EmptyWatchlist = ({ loading }: { loading: boolean }) => (
  <div>
    <SectionHeader title="Up next" loading={loading} />
    <div className="flex h-[292px] items-center justify-center w-full inset-0 text-white">
      <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
    </div>
  </div>
);

const UpNext = () => {
  const [watchList, setWatchList] = useState<WatchListSeries[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);

        const seriesWatchlist = await getMySeriesWatchlist(4);
        setWatchList(seriesWatchlist || []);
      } catch (err) {
        console.error("Watchlist error:", err);
        setError("Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (watchList?.length === 0 && !loading) {
    return <EmptyWatchlist loading={loading} />;
  }

  return (
    <div
      className={cn(
        "transition-opacity",
        loading ? "opacity-70" : "opacity-100"
      )}
    >
      <div className="flex justify-between items-center">
        <SectionHeader title="Up next" loading={loading} />
      </div>

      <div className="flex flex-wrap items-center justify-center mt-3 w-full gap-y-2 py-4">
        {watchList?.map((series) => (
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
    </div>
  );
};

export default UpNext;
