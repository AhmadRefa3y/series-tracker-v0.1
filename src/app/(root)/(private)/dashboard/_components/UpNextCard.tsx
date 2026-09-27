"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markEpisodWatched } from "@/app/(root)/(private)/watchlist/actions";
import { cn } from "@/lib/utils";
import type { Episode, UpNextItem } from "@/types/seriesT";

const STILL_BASE = "https://image.tmdb.org/t/p/w780";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const PROGRESS_BASE = "https://image.tmdb.org/t/p/original";

/** Official IMDb logo (Simple Icons path, 24x24). */
const IMDB_LOGO =
  "M22.3781 0H1.6218C.7411.0583.0587.7437.0018 1.5953l-.001 20.783c.0585.8761.7125 1.543 1.5559 1.6191A.337.337 0 0 0 1.6016 24h20.7971a.4579.4579 0 0 0 .0437-.002c.8727-.0768 1.5568-.8271 1.5568-1.7085V1.7098c0-.8914-.696-1.6416-1.584-1.7078A.3294.3294 0 0 0 22.3781 0zm0 .496a1.2144 1.2144 0 0 1 1.1252 1.2139v20.5797c0 .6377-.4875 1.1602-1.1045 1.2145H1.6016c-.5967-.0543-1.0645-.5297-1.1053-1.1258V1.6284C.5371 1.0185 1.0184.5364 1.6217.496h20.7564zM4.7954 8.2603v7.3636H2.8899V8.2603h1.9055zm6.5367 0v7.3636H9.6707v-4.9704l-.6711 4.9704H7.813l-.6986-4.8618-.0066 4.8618h-1.668V8.2603h2.468c.0748.4476.1492.9694.2307 1.5734l.2712 1.8713.4407-3.4447h2.4817zm2.9772 1.3289c.0742.0404.122.108.1417.2034.0279.0953.0345.3118.0345.6442v2.8548c0 .4881-.0345.7867-.0955.8954-.0609.1152-.2304.1695-.5018.1695V9.5211c.204 0 .3457.0205.4211.0681zm-.0211 6.0347c.4543 0 .8006-.0265 1.0245-.0742.2304-.0477.4204-.1357.5694-.2648.1556-.1218.2642-.298.3251-.5219.0611-.2238.1021-.6648.1021-1.3224v-2.5832c0-.6986-.0271-1.1668-.0742-1.4039-.041-.237-.1431-.4543-.3126-.6437-.1695-.1973-.4198-.3324-.7456-.421-.3191-.0808-.8542-.1285-1.7694-.1285h-1.4244v7.3636h2.3051zm5.14-1.7827c0 .3523-.0199.5762-.0544.6708-.033.0947-.1894.1424-.3046.1424-.1086 0-.19-.0477-.2238-.1351-.041-.0887-.0609-.2986-.0609-.6238v-1.9469c0-.3324.0199-.5423.0543-.6237.0338-.0808.1086-.122.2171-.122.1153 0 .2709.0412.3114.1425.041.0947.0609.2986.0609.6032v1.8926zm-2.4747-5.5809v7.3636h1.7157l.1152-.4675c.1556.1894.3251.3324.5152.4271.1828.0881.4608.1357.678.1357.3047 0 .5629-.0748.7802-.237.2165-.1562.3589-.3462.4198-.5628.0543-.2173.0887-.543.0887-.9841v-2.0675c0-.4409-.0139-.7324-.0344-.8681-.0199-.1357-.0742-.2781-.1695-.4204-.1021-.1425-.2437-.251-.4272-.3325-.1834-.0742-.3999-.1152-.6576-.1152-.2172 0-.4952.0477-.6846.1285-.1835.0887-.353.2238-.5086.4007V8.2603h-1.8309z";

const formatDuration = (minutes: number) => {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const formatRemaining = (minutes: number) =>
  minutes >= 24 * 60 ? `${Math.round(minutes / (24 * 60))}d` : formatDuration(minutes);

const formatEpisodeLabel = (episode: Episode) => {
  const prefix = `S${episode.season_number} • E${episode.episode_number}`;
  return episode.name ? `${prefix} - ${episode.name}` : prefix;
};

const isAtOrBefore = (
  episode: Episode,
  marked: { seasonNumber: number; episodeNumber: number }
) =>
  episode.season_number < marked.seasonNumber ||
  (episode.season_number === marked.seasonNumber &&
    episode.episode_number <= marked.episodeNumber);

const UpNextCard = ({
  item,
  preload = false,
}: {
  item: UpNextItem;
  preload?: boolean;
}) => {
  const router = useRouter();
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [isMarking, setIsMarking] = useState(false);
  const busy = useRef(false);
  const lastMarked = useRef<{ seasonNumber: number; episodeNumber: number } | null>(
    null
  );

  const currentEpisode = item.nextEpisodes[episodeIndex] ?? null;
  const watchedOverall = item.watchedCount + episodeIndex;
  const episodesLeft =
    item.totalEpisodes > 0
      ? Math.max(0, item.totalEpisodes - watchedOverall)
      : 0;
  const remainingTime =
    episodesLeft > 0 && currentEpisode?.runtime ? episodesLeft * currentEpisode.runtime : 0;

  // The server sends a fresh batch of episodes after a refresh. Skip past
  // anything we already marked so a slow refresh can't rewind the card.
  useEffect(() => {
    const marked = lastMarked.current;
    let start = 0;
    if (marked) {
      while (
        start < item.nextEpisodes.length &&
        isAtOrBefore(item.nextEpisodes[start], marked)
      ) {
        start++;
      }
    }
    setEpisodeIndex(start);
    setIsMarking(false);
    busy.current = false;
  }, [item.nextEpisodes]);

  const seriesHref = `/shows/${item.title}-${item.seriesId}`;
  const watchHref = currentEpisode
    ? `${seriesHref}/episode/${item.seriesId}-${currentEpisode.season_number}-${currentEpisode.episode_number}`
    : seriesHref;

  const handleMarkWatched = async () => {
    if (!currentEpisode || busy.current) return;

    busy.current = true;
    setIsMarking(true);
    lastMarked.current = {
      seasonNumber: currentEpisode.season_number,
      episodeNumber: currentEpisode.episode_number,
    };

    try {
      const res = await markEpisodWatched({
        episodeData: {
          seriesID: item.seriesId,
          episodeNumber: currentEpisode.episode_number,
          seasonNumber: currentEpisode.season_number,
        },
      });

      if (!res.success) {
        lastMarked.current = null;
        toast.error(res.message);
        setIsMarking(false);
        busy.current = false;
        return;
      }

      toast.success(res.message);
      setEpisodeIndex((index) => index + 1);
      router.refresh();
    } catch (error) {
      console.error("Error marking episode:", error);
      lastMarked.current = null;
      toast.error("An error occurred");
      setIsMarking(false);
      busy.current = false;
    }
  };

  return (
    <article className="group/card relative w-[300px] shrink-0 sm:w-[340px]">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-[#1d1922] ring-1 ring-white/[0.06] transition-all duration-300 group-hover/card:ring-primaryColor/40">
        {currentEpisode ? (
          <Image
            src={
              currentEpisode.still_path
                ? `${PROGRESS_BASE}${currentEpisode.still_path}`
                : item.posterPath
                  ? `${POSTER_BASE}${item.posterPath}`
                  : ""
            }
            alt={currentEpisode.name || item.title}
            fill
            preload={preload}
            sizes="(max-width: 640px) 300px, 340px"
            className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1d1922]">
            <Loader2 className="size-5 animate-spin text-[#a78bfa]" />
          </div>
        )}

        {currentEpisode && (
          <Link
            href={watchHref}
            aria-label={`Play ${item.title} ${formatEpisodeLabel(currentEpisode)}`}
            className="absolute inset-0 z-10"
          />
        )}

        {item.imdbRating && (
          <span
            className="pointer-events-none absolute left-1.5 top-1.5 z-20 flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
            title={`IMDb ${item.imdbRating}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="#f5c518"
              aria-hidden="true"
            >
              <path d={IMDB_LOGO} />
            </svg>
            {item.imdbRating}
          </span>
        )}

        {currentEpisode && (currentEpisode.runtime || episodesLeft > 0) && (
          <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-20 flex items-center justify-between gap-2 rounded-md bg-black/80 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold text-white">
              {currentEpisode.runtime ? formatDuration(currentEpisode.runtime) : ""}
            </span>
            <span className="text-xs text-white/90">
              {episodesLeft > 0
                ? `${episodesLeft} left${
                    remainingTime ? ` · ${formatRemaining(remainingTime)}` : ""
                  }`
                : ""}
            </span>
          </div>
        )}

        {/* Series progress bar — Trakt-style completion indicator */}
        {item.totalEpisodes > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-black/60"
          >
            <div
              className="h-full bg-primaryColor transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((watchedOverall / item.totalEpisodes) * 100)
                )}%`,
              }}
            />
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Episode options"
              className="absolute right-1.5 top-1.5 z-30 flex size-7 items-center justify-center rounded-md text-white/90 transition-colors duration-200 hover:bg-black/50 hover:text-white"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[11rem] border-white/10 bg-[#17141a] text-white"
          >
            <DropdownMenuItem
              onClick={handleMarkWatched}
              disabled={!currentEpisode || isMarking}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Check className="size-4" />
              Mark episode watched
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
              <Link href={seriesHref}>Open show</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-white">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[13px] text-white/50">
            {currentEpisode ? formatEpisodeLabel(currentEpisode) : "Fetching next episode…"}
          </p>
          {item.totalEpisodes > 0 && (
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-primaryColor/90">
              {watchedOverall}/{item.totalEpisodes} episodes
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleMarkWatched}
          disabled={isMarking || !currentEpisode}
          aria-label="Mark episode as watched"
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md text-[#a78bfa] transition-colors duration-200 hover:bg-white/5 hover:text-[#c4b5fd]",
            (isMarking || !currentEpisode) && "cursor-not-allowed opacity-40"
          )}
        >
          {isMarking ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Check className="size-5" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </article>
  );
};

export default UpNextCard;
