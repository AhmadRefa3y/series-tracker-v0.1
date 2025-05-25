import { getTrendingSeries } from "@/data/tmdb";
import Image from "next/image";
import { Check, Star, StarIcon } from "lucide-react";

import Link from "next/link";
import AddToWatchListBtn from "@/components/AddToWatchListBtn";
import { auth } from "@/auth";
import { IsSeriesTracked } from "@/lib/actions/seriesActions"; // Import IsSeriesTracked

export default async function Home() {
  const series = await getTrendingSeries();
  const session = await auth();

  const seriesWithTrackingStatus = await Promise.all(
    series.map(async (s) => {
      const isTracked = await IsSeriesTracked({ seriesID: s.id.toString() });
      return {
        ...s,
        isTracked: !!isTracked,
      };
    })
  );

  return (
    <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3  ">
      {seriesWithTrackingStatus.map((series) => (
        <div key={series.id} className="flex flex-col">
          <Link
            key={series.id}
            href={`shows/${series.name}-${series.id}`}
            className="relative aspect-[3/2] overflow-hidden group"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w780/${series.backdrop_path}`}
              alt={series.name}
              fill
              className=" object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t to-30% from-black/70 to-transparent   transition-opacity duration-300 flex flex-col justify-end p-3" />
            <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-white">
                  {series.vote_average.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-white font-bold text-lg">
              {series.name}{" "}
              <span className=" font-light text-sm">
                {series.first_air_date.split("-")[0]}
              </span>
            </div>
          </Link>
          <div className="flex bg-[#2d2d2d] border-r  border-[#414040] ">
            <span className="text-white p-2  hover:bg-[#0082ce] duration-200">
              <Check strokeWidth={4} />
            </span>
            <AddToWatchListBtn
              seriesData={{
                id: series.id.toString(),
                title: series.name,
                poster: `https://image.tmdb.org/t/p/w780/${series.poster_path}`,
              }}
              key={series.id}
              session={session}
              isTracked={series.isTracked}
            />
            <span className="text-white p-2  hover:bg-[#ff5f06] duration-200">
              <StarIcon strokeWidth={2} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
