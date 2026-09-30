import type { Session } from "next-auth";
import { SearchX } from "lucide-react";

import prismaDb from "@/lib/prisma";
import {
  hasActiveFilters,
  toDiscoverParams,
  type ShowFilterState,
} from "@/app/(root)/shows/filterConfig";
import { discoverTvShows, type DiscoverTvResult } from "@/app/(root)/shows/discoverData";
import { getTrendingSeries } from "@/app/(root)/shows/showsData";
import Pagination from "@/app/(root)/shows/components/Pagination";
import ShowCard, { type ShowCardData } from "@/app/(root)/shows/components/ShowCard";

interface ShowGridProps {
  session: Session | null;
  filters: ShowFilterState;
  page: number;
}

export function ShowsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <div key={index} className="flex animate-pulse flex-col">
          <div className="aspect-[2/3] w-full rounded-xl border border-white/[0.06] bg-[#221d29]" />
          <div className="mt-3 h-3.5 w-3/4 rounded bg-[#221d29]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#221d29]" />
        </div>
      ))}
    </div>
  );
}

export default async function ShowGrid({ session, filters, page }: ShowGridProps) {
  const loggedIn = Boolean(session?.user);

  let data: DiscoverTvResult;
  if (hasActiveFilters(filters)) {
    data = await discoverTvShows(toDiscoverParams(filters, page), loggedIn);
  } else {
    const trending = await getTrendingSeries(loggedIn, page);
    if (!trending) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <SearchX className="size-10 text-white/30" />
          <p className="text-sm text-white/60">
            We couldn&apos;t load shows right now. Please try again.
          </p>
        </div>
      );
    }
    data = {
      results: trending.results,
      page,
      total_pages: trending.total_pages > 500 ? 500 : trending.total_pages,
      total_results: trending.total_results,
    };
  }

  // One query powers tracking state and the "hide my watchlist" filter.
  const userSeries = session?.user
    ? await prismaDb.series.findMany({
        where: { userId: session.user.id },
        include: { watchedEpisodes: true },
      })
    : [];
  const trackedByTmdbId = new Map(
    userSeries.map((series) => [series.seriesTmdbId, series])
  );

  let results = data.results;
  let hiddenCount = 0;
  if (filters.excludeTracked && session?.user) {
    const before = results.length;
    results = results.filter(
      (series) => !trackedByTmdbId.has(series.id.toString())
    );
    hiddenCount = before - results.length;
  }

  const cards: ShowCardData[] = results.map((show) => {
    const tracked = trackedByTmdbId.get(show.id.toString());
    const watched = tracked?.watchedEpisodes.length ?? 0;
    const total = show.number_of_episodes ?? 0;
    return {
      ...show,
      isTracked: Boolean(tracked),
      watchedEpisodes: watched,
      Finished: Boolean(tracked) && total > 0 && watched >= total,
    };
  });

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-white/45">
          {data.total_results > 0
            ? `Showing ${cards.length} of ${data.total_results.toLocaleString()} shows`
            : "No results"}
        </p>
        <p className="text-xs text-white/35">
          Page {data.page} of {data.total_pages}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-24 text-center">
          <SearchX className="size-10 text-white/30" />
          <div>
            <h2 className="text-base font-semibold text-white">
              No shows found
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Try widening your filters or removing a few.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
          {cards.map((series) => (
            <ShowCard key={series.id} series={series} session={session} />
          ))}
        </div>
      )}

      {hiddenCount > 0 ? (
        <p className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-white/45">
          {hiddenCount} show{hiddenCount === 1 ? "" : "s"} hidden because they are
          on your watchlist.
        </p>
      ) : null}

      <Pagination
        currentPageProp={data.page}
        totalPagesProp={data.total_pages}
      />
    </div>
  );
}
