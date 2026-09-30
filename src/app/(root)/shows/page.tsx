import { Suspense } from "react";

import { auth } from "@/auth";
import { DEFAULT_WATCH_REGION, parseShowFilters } from "@/app/(root)/shows/filterConfig";
import { getFilterOptions } from "@/app/(root)/shows/filtersData";
import { ShowFiltersProvider } from "@/app/(root)/shows/filters/ShowFiltersProvider";
import {
  FilterSidebar,
  MobileFilterButton,
} from "@/app/(root)/shows/filters/FilterSidebar";
import ActiveFilters from "@/app/(root)/shows/filters/ActiveFilters";
import ShowGrid, {
  ShowsGridSkeleton,
} from "@/app/(root)/shows/components/ShowGrid";

export const metadata = {
  title: "Discover Shows - Sennit",
};

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function toSearchParams(params: SearchParamsRecord) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((entry) => searchParams.append(key, entry));
    else searchParams.set(key, value);
  }
  return searchParams;
}

export default async function Shows({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const params = await searchParams;
  const urlParams = toSearchParams(params);

  const region = urlParams.get("watch_region") || DEFAULT_WATCH_REGION;
  const [session, options] = await Promise.all([
    auth(),
    getFilterOptions(region),
  ]);

  const filters = parseShowFilters(urlParams);
  const page = Math.max(1, Number(urlParams.get("page")) || 1);

  return (
    <ShowFiltersProvider
      options={options}
      isLoggedIn={Boolean(session?.user)}
    >
      <div className="flex-1 bg-[#17141a]">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Discover Shows
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Filter thousands of series by genre, network, rating and more.
              </p>
            </div>
            <MobileFilterButton />
          </div>

          <div className="flex items-start gap-6">
            <FilterSidebar />
            <div className="min-w-0 flex-1">
              <ActiveFilters />
              <Suspense key={urlParams.toString()} fallback={<ShowsGridSkeleton />}>
                <ShowGrid session={session} filters={filters} page={page} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </ShowFiltersProvider>
  );
}
