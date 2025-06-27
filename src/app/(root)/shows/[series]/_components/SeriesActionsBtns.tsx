"use client";

import { BookMarked, StarIcon } from "lucide-react";
import AddToWatchListBtn from "./AddToWatchListBtn";

import AddToHistoryBtn from "@/app/(root)/shows/[series]/_components/AddToHistoryBtn";

const SeriesActionsBtns = ({
  seriesData,
}: {
  seriesData: {
    id: string;
    title: string;
    poster: string;
    number_of_episodes: number;
    isTracked: boolean;
    Finished: boolean;
    watchedEpisodes: number;
  };
}) => {
  return (
    <div className="text-black flex flex-col gap-1 lg:w-1/3">
      <AddToWatchListBtn seriesData={seriesData} />
      <AddToHistoryBtn seriesData={seriesData} />
      <button className="w-full   border flex items-center border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white duration-200 relative group p-3 uppercase cursor-pointer ">
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100">
          Coming soon
        </div>
        <BookMarked strokeWidth={1} size={30} />
        <span className="ml-2 font-semibold"> Add to collection</span>
      </button>
      <button className="w-full   border flex items-center border-[#ff5f06] text-[#ff5f06] hover:bg-[#ff5f06] hover:text-white duration-200 p-3 relative group uppercase cursor-pointer group">
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100">
          Coming soon
        </div>
        <StarIcon
          strokeWidth={1}
          size={30}
          className="group-hover:fill-[#ff5f06]"
        />
        <span className="ml-2 font-semibold"> Add to favorites</span>
      </button>
    </div>
  );
};

export default SeriesActionsBtns;
