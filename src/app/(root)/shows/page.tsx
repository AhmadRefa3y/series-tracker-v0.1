import Image from "next/image";
import { Star, StarIcon } from "lucide-react";
import { Suspense } from "react";

import Link from "next/link";
import AddToWatchListBtn from "@/app/(root)/shows/components/AddToWatchListBtn";
import { auth } from "@/auth";
import { getTrendingSeries } from "@/app/(root)/shows/showsData";
import { discoverTvShows } from "@/app/(root)/shows/discoverData";
import { getTvGenres } from "@/app/(root)/shows/genresData";
import AddToWatchedHistoryBtn from "@/app/(root)/shows/components/AddToWatchedHistoryBtn";
import prismaDb from "@/lib/prisma";
import FilterControls from "@/app/(root)/shows/components/FilterControls";
import Pagination from "@/app/(root)/shows/components/Pagination";

export const metadata = {
  title: "Trending Shows - Sennit ",
};

// Loading skeleton component
function ShowsSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col animate-pulse">
          <div className="relative aspect-[3/2] overflow-hidden bg-gray-700 rounded-t-lg" />
          <div className="flex bg-[#2d2d2d] border-r border-[#414040] h-12">
            <div className="w-1/3 bg-gray-700" />
            <div className="w-1/3 bg-gray-700" />
            <div className="w-1/3 bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Filter controls skeleton
function FilterControlsSkeleton() {
  return (
    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-20 bg-gray-700 rounded"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default async function Shows({
  searchParams,
}: {
  searchParams: Promise<{
    genreIds?: string;
    "first_air_date.gte"?: string;
    "first_air_date.lte"?: string;
    "vote_average.gte"?: string;
    "vote_average.lte"?: string;
    with_original_language?: string;
    sort_by?: string;
    page?: number;
  }>;
}) {
  const session = await auth();

  // Get filters from search params
  const params = await searchParams;

  const genreIds = params?.genreIds || "";
  const startDate = params?.["first_air_date.gte"] || "";
  const endDate = params?.["first_air_date.lte"] || "";
  const voteAverageGte = params?.["vote_average.gte"] || "";
  const voteAverageLte = params?.["vote_average.lte"] || "";
  const language = params?.with_original_language || "";
  const sortBy = params?.sort_by || "popularity.desc";
  const page = params?.page || 1;

  // Fetch genres for filter controls
  const genres = await getTvGenres();

  // Fetch shows based on filters
  let showsData;
  if (
    genreIds ||
    startDate ||
    endDate ||
    voteAverageGte ||
    voteAverageLte ||
    language ||
    sortBy !== "popularity.desc"
  ) {
    // Use discover endpoint when filters are applied
    showsData = await discoverTvShows(
      {
        with_genres: genreIds,
        "first_air_date.gte": startDate,
        "first_air_date.lte": endDate,
        "vote_average.gte": voteAverageGte
          ? parseFloat(voteAverageGte)
          : undefined,
        "vote_average.lte": voteAverageLte
          ? parseFloat(voteAverageLte)
          : undefined,
        with_original_language: language,
        sort_by: sortBy,
        page: page,
      },
      !!session?.user
    );
  } else {
    // Use trending endpoint when no filters are applied
    const trendingShows = await getTrendingSeries(!!session?.user);
    showsData = {
      results: trendingShows,
      page: 1,
      total_pages: 4,
      total_results: trendingShows.length,
    };
  }

  const { results: shows, page: currentPage, total_pages } = showsData;

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

  const seriesWithTrackingStatus = shows.map((show) => ({
    ...show,
    isTracked: UserShows.some(
      (userShow) => userShow.seriesTmdbId === show.id.toString()
    ),
    Finished: UserShows.some(
      (userShow) =>
        userShow.seriesTmdbId === show.id.toString() &&
        userShow.watchedEpisodes.length === show.number_of_episodes
    ),
    watchedEpisodes:
      UserShows.find((userShow) => userShow.seriesTmdbId === show.id.toString())
        ?.watchedEpisodes.length || 0,
  }));

  return (
    <div className="flex bg-[#1a1a1a]">
      <Suspense fallback={<FilterControlsSkeleton />}>
        <FilterControls genres={genres} />
      </Suspense>

      <Suspense fallback={<ShowsSkeleton />} key={JSON.stringify(params)}>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
          {seriesWithTrackingStatus.length === 0 ? (
            <div className="text-center py-10 col-span-full">
              <h2 className="text-xl font-bold">No shows found</h2>
              <p className="text-gray-400 mt-2">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            seriesWithTrackingStatus.map((series) => (
              <div key={series.id} className="flex flex-col">
                <Link
                  href={`shows/${series.name
                    .replace(/\s+/g, "")
                    .toLowerCase()}-${series.id}`}
                  className="relative aspect-[3/2] overflow-hidden group"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w780/${series.backdrop_path}`}
                    alt={series.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t to-30% from-black/70 to-transparent transition-opacity duration-300 flex flex-col justify-end p-3" />
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
                    <span className="font-light text-sm">
                      {series.first_air_date?.split("-")[0] || "N/A"}
                    </span>
                  </div>
                </Link>
                <div className="flex bg-[#2d2d2d] border-r border-[#414040]">
                  <AddToWatchListBtn
                    seriesData={{
                      id: series.id.toString(),
                      title: series.name,
                      poster: `https://image.tmdb.org/t/p/w780/${series.poster_path}`,
                    }}
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
                  />
                  <button className="text-white p-2 hover:bg-[#ff5f06] duration-200">
                    <StarIcon strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          <Pagination currentPage={currentPage} totalPages={total_pages} />
        </div>
      </Suspense>
    </div>
  );
}
