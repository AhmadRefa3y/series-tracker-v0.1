"use client";

import { BookMarked, Check, StarIcon } from "lucide-react";
import AddToWatchList from "./addToWatchList";

const SeriesActionsBtns = ({
  seriesData,
}: {
  seriesData: {
    id: string;
    title: string;
    poster: string;
    number_of_episodes: number;
  };
}) => {
  return (
    <div className="text-black flex flex-col gap-1 lg:w-1/3">
      <button className="w-full   border flex items-center border-[#9f42c6] text-[#9f42c6] hover:bg-[#9f42c6] hover:text-white duration-200 p-3 uppercase cursor-pointer ">
        <Check strokeWidth={2} size={30} />
        <span className="ml-2 font-semibold"> Add to history</span>
      </button>
      <button className="w-full   border flex items-center border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white duration-200 p-3 uppercase cursor-pointer ">
        <BookMarked strokeWidth={1} size={30} />
        <span className="ml-2 font-semibold"> Add to collection</span>
      </button>
      <AddToWatchList seriesData={seriesData} />
      <button className="w-full   border flex items-center border-[#ff5f06] text-[#ff5f06] hover:bg-[#ff5f06] hover:text-white duration-200 p-3 uppercase cursor-pointer group">
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
