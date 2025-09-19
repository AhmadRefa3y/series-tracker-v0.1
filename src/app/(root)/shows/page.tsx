import { Suspense } from "react";

import { auth } from "@/auth";
import { getTvGenres } from "@/app/(root)/shows/genresData";
import FilterControls from "@/app/(root)/shows/components/FilterControls";
import ShowGrid from "@/app/(root)/shows/components/ShowGrid";

export const metadata = {
  title: "Trending Shows - Sennit ",
};

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

  // Fetch genres for filter controls
  const genres = await getTvGenres();

  return (
    <div className="flex bg-[#1a1a1a] flex-1">
      <Suspense
        fallback={<FilterControlsSkeleton />}
        key={JSON.stringify(genres)}
      >
        <FilterControls genres={genres} />
      </Suspense>
      <ShowGrid session={session} params={params} />
    </div>
  );
}
