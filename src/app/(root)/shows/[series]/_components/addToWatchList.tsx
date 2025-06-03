import { cn } from "@/lib/utils";
import { Loader, RefreshCcw, Text } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { AddSeriesToWatchlist } from "../../actions";
import { removeSeriesFromWatchlist } from "../../data";

const AddToWatchList = ({
  seriesData,
}: {
  seriesData: {
    id: string;
    title: string;
    poster: string;
    number_of_episodes: number;
    isTracked: boolean;
  };
}) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<boolean | null>(seriesData.isTracked);

  // Check if the series is already added

  const handleToast = (success: boolean, message: string) => {
    toast[success ? "success" : "error"](message, {
      description: `${seriesData.title} ${
        success ? "added to" : "removed from"
      } watchlist`,
    });
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      if (!added) {
        const saveSeries = await AddSeriesToWatchlist({ seriesData });
        handleToast(saveSeries.success, "Series added to watchlist");
        if (saveSeries.success) setAdded(true);
      } else {
        const removeSeries = await removeSeriesFromWatchlist(seriesData.id);
        handleToast(removeSeries.success, "Series removed from watchlist");
        if (removeSeries.success) setAdded(false);
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (added === null) {
    return (
      <button className="w-full border flex items-center justify-center border-[#9f42c6] text-[#9f42c6] hover:bg-[#9f42c6] hover:text-white duration-200 p-3">
        <Loader className="animate-spin" />
      </button>
    );
  }

  return (
    <button
      className={cn(
        "w-full border border-[#0082ce] h-[55px] text-[#0082ce] hover:bg-[#0082ce] hover:text-white duration-200 px-3 uppercase cursor-pointer flex items-center relative",
        { "bg-[#0082ce] text-white": added }
      )}
      onClick={handleClick}
      disabled={loading}
    >
      {loading && (
        <div className="flex items-center justify-center w-full absolute inset-0  bg-black/60 text-white">
          <RefreshCcw className="animate-spin" size={30} />
        </div>
      )}
      {added ? (
        <div className="flex items-center">
          <Text strokeWidth={1} size={30} />
          <div className="ml-2 flex flex-col items-start">
            <div className="font-semibold">
              Listed on <br />
            </div>
            <div className="text-xs text-left">watchlist</div>
          </div>
        </div>
      ) : (
        <>
          <Text strokeWidth={1} size={30} />
          <span className="ml-2 font-semibold">Add to watchlist</span>
        </>
      )}
    </button>
  );
};

export default AddToWatchList;
