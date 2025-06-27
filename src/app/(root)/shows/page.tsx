import Image from "next/image";
import { Star, StarIcon } from "lucide-react";

import Link from "next/link";
import AddToWatchListBtn from "@/app/(root)/shows/components/AddToWatchListBtn";
import { auth } from "@/auth";
import { getTrendingSeries } from "@/app/(root)/shows/showsData";
import AddToWatchedHistoryBtn from "@/app/(root)/shows/components/AddToWatchedHistoryBtn";
import prismaDb from "@/lib/prisma";

export const metadata = {
  title: "Trending Shows - Sennit ",
};
export default async function Shows() {
  const session = await auth();
  const TrendingShows = await getTrendingSeries(!!session?.user);

  const UserShows = session?.user
    ? await prismaDb.series.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          watchedEpisodes: true,
        },
      })
    : [];
  const seriesWithTrackingStatus = TrendingShows.map((TShow) => ({
    ...TShow,
    isTracked: UserShows.some(
      (UserShows) => UserShows.seriesTmdbId === TShow.id.toString()
    ),
    Finished: UserShows.some(
      (Show) =>
        Show.seriesTmdbId === TShow.id.toString() &&
        Show.watchedEpisodes.length === TShow.number_of_episodes
    ),
    watchedEpisodes:
      UserShows.find((Show) => Show.seriesTmdbId === TShow.id.toString())
        ?.watchedEpisodes.length || 0,
  }));

  seriesWithTrackingStatus.map((series) => {
    console.log(
      `Series: ${series.name}, watchedEpisodes: ${series.watchedEpisodes}, number_of_episodes: ${series.number_of_episodes}`
    );
  });
  return (
    <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  ">
      {seriesWithTrackingStatus.map((series) => (
        <div key={series.id} className="flex flex-col">
          <Link
            key={series.id}
            href={`shows/${series.name.replace(/\s+/g, "_").toLowerCase()}-${
              series.id
            }`}
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
            <AddToWatchedHistoryBtn
              Finished={series.Finished}
              seriesData={{
                id: series.id.toString(),
                title: series.name,
                posterPath: `https://image.tmdb.org/t/p/w780/${series.poster_path}`,
              }}
              session={session}
              key={`watched-${series.id}`}
            />
            <button className="text-white p-2  hover:bg-[#ff5f06] duration-200">
              <StarIcon strokeWidth={2} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
