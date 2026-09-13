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

const UpNextCard = ({ item }: { item: UpNextItem }) => {
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
    <article className="group/card relative w-[272px] shrink-0 sm:w-[300px]">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-[#141414]">
        {currentEpisode ? (
          <Image
            src={
              currentEpisode.still_path
                ? `${STILL_BASE}${currentEpisode.still_path}`
                : item.posterPath
                  ? `${POSTER_BASE}${item.posterPath}`
                  : ""
            }
            alt={currentEpisode.name || item.title}
            fill
            sizes="(max-width: 640px) 272px, 300px"
            className="object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#141414]">
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
            className="min-w-[11rem] border-white/10 bg-[#1d1d1d] text-white"
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
