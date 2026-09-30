import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, ListVideo, Star } from "lucide-react";
import type { Session } from "next-auth";

import AddToWatchListBtn from "@/app/(root)/shows/components/AddToWatchListBtn";
import AddToWatchedHistoryBtn from "@/app/(root)/shows/components/AddToWatchedHistoryBtn";
import type { TrendingSeriesT } from "@/types";

export interface ShowCardData extends TrendingSeriesT {
  isTracked: boolean;
  Finished: boolean;
  watchedEpisodes: number;
}

const posterUrl = (series: ShowCardData) => {
  const path = series.poster_path || series.backdrop_path;
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

const seriesHref = (series: ShowCardData) =>
  `shows/${series.name.replace(/\s+/g, "").toLowerCase()}-${series.id}`;

export default function ShowCard({
  series,
  session,
}: {
  series: ShowCardData;
  session: Session | null;
}) {
  const poster = posterUrl(series);
  const total = series.number_of_episodes || 0;
  const watched = series.watchedEpisodes || 0;
  const progress =
    series.isTracked && total > 0 ? Math.min(100, (watched / total) * 100) : 0;
  const year = series.first_air_date?.split("-")[0];

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          href={seriesHref(series)}
          className="relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06] bg-[#221d29] shadow-lg shadow-black/30 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-xl group-hover:shadow-black/50"
        >
          {poster ? (
            <Image
              src={poster}
              alt={series.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              No image
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Rating */}
          <div className="pointer-events-none absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm">
            <Star className="size-3 fill-primaryColor text-primaryColor" />
            <span className="text-xs font-semibold text-white">
              {series.vote_average ? series.vote_average.toFixed(1) : "—"}
            </span>
          </div>

          {/* Tracking state */}
          {series.Finished ? (
            <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1">
              <CheckCircle2 className="size-3 text-white" />
              <span className="text-[10px] font-bold text-white">Watched</span>
            </div>
          ) : series.isTracked ? (
            <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#6c3384]/90 px-2 py-1">
              <ListVideo className="size-3 text-white" />
              <span className="text-[10px] font-bold text-white">
                {total > 0 ? `${watched}/${total}` : "Tracked"}
              </span>
            </div>
          ) : null}

          {/* Overview on hover */}
          {series.overview ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 px-3 pb-14 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="line-clamp-3 text-xs leading-relaxed text-white/80">
                {series.overview}
              </p>
            </div>
          ) : null}
        </Link>

        {/* Actions sit outside the link so they never trigger navigation */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-2">
          <span className="pointer-events-none flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            <Calendar className="size-3" />
            {year || "N/A"}
          </span>
          <span className="pointer-events-auto flex items-center gap-1 rounded-lg bg-black/60 p-0.5 backdrop-blur-sm">
            <AddToWatchListBtn
              seriesData={{
                id: series.id.toString(),
                title: series.name,
                poster: poster ?? "",
              }}
              session={session}
              isTracked={series.isTracked}
              className="size-8 rounded-md text-white/80 hover:bg-[#6c3384] hover:text-white"
            />
            <AddToWatchedHistoryBtn
              Finished={series.Finished}
              seriesData={{
                id: series.id.toString(),
                title: series.name,
                posterPath: poster ?? "",
              }}
              session={session}
              className="size-8 rounded-md text-white/80 hover:bg-[#0082ce] hover:text-white"
            />
          </span>
        </div>
      </div>

      <Link href={seriesHref(series)} className="mt-2.5 flex flex-col gap-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-primaryColor">
          {series.name}
        </h3>
        <p className="line-clamp-1 text-xs text-white/40">
          {[
            year,
            series.number_of_seasons
              ? `${series.number_of_seasons} season${
                  series.number_of_seasons > 1 ? "s" : ""
                }`
              : series.number_of_episodes
              ? `${series.number_of_episodes} episodes`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </Link>

      {series.isTracked && total > 0 ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primaryColor"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}
