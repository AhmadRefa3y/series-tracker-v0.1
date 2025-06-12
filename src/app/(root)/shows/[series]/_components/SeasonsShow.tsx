import { IMAGE_BASE_URL } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface SeasonData {
  air_date: string | null; // e.g., "2011-04-17"
  episode_count: number;
  id: number;
  name: string; // e.g., "Season 1"
  overview: string;
  poster_path: string | null; // URL path to season poster
  season_number: number;
  vote_average: number; // Season-specific rating
}
interface SeasonsProps {
  SeasonsData: SeasonData[];
  seriesName: string;
}
const SeasonsShow = async ({ SeasonsData, seriesName }: SeasonsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
      {SeasonsData.filter((season) => season.season_number !== 0).map(
        (season, i) => (
          <Link
            key={i}
            className="flex flex-col items-center gap-4 hover:scale-110 rounded-sm hover:rotate-2   duration-200 cursor-pointer capitalize w-full group relative"
            href={`?season=${season.season_number}#seasons`}
            scroll={false}
          >
            <div className="absolute bottom-[102%] left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center">
              <div className="bg-black flex flex-col items-center rounded-lg">
                <span className=" text-white text-sm font-semibold px-3 py-1 rounded shadow-lg whitespace-nowrap">
                  {seriesName}
                </span>
                <span className=" text-white text-sm font-semibold px-3 py-1 rounded shadow-lg whitespace-nowrap">
                  Season {season.season_number}
                </span>
              </div>
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black mx-auto"></div>
            </div>
            <div className="relative w-full aspect-[2/3] max-w-[200px] bg-gray-200 overflow-hidden rounded-sm ">
              {season.poster_path ? (
                <Image
                  src={`${IMAGE_BASE_URL}${season.poster_path}`}
                  alt={season.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-lg text-gray-500">
                  No Image
                </div>
              )}
            </div>
            <div className="text-center w-full">
              <div className="font-semibold text-base truncate text-gray-800">
                season {season.season_number}
              </div>
              <div className="text-[15px] text-gray-500">
                {season.episode_count} episodes
              </div>
            </div>
          </Link>
        )
      )}
    </div>
  );
};

export default SeasonsShow;
