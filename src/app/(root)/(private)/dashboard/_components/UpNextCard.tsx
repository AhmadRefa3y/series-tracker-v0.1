"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  Check,
  Eye,
  EyeOff,
  Info,
  Loader2,
  MoreVertical,
  Play,
  Star,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Episode, UpNextItem } from "@/types/seriesT";
import {
  getUpNextImdbId,
  markEpisodeWatchedUpNext,
  setUpNextSeriesStatus,
  unmarkEpisodeUpNext,
} from "../upNextActions";

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
  minutes >= 24 * 60
    ? `${Math.round(minutes / (24 * 60))}d`
    : formatDuration(minutes);

const formatEpisodeLabel = (episode: Episode) => {
  const prefix = `S${episode.season_number} • E${episode.episode_number}`;
  return episode.name ? `${prefix} - ${episode.name}` : prefix;
};

/**
 * Artwork already decoded in this session. When the slide swaps to the next
 * episode, the incoming still renders at full opacity on its very first frame
 * — no fade-from-blank while the network image loads.
 */
const decodedStills = new Set<string>();

/** The image a given next-episode renders (still art, else the series poster). */
const episodeImageSrc = (episode: Episode | null, posterPath: string | null) =>
  episode?.still_path
    ? `${STILL_BASE}${episode.still_path}`
    : posterPath
      ? `${POSTER_BASE}${posterPath}`
      : null;

const FadeImage = ({
  src,
  alt,
  preload,
}: {
  src: string;
  alt: string;
  preload: boolean;
}) => {
  // Start visible when we already have the bytes, so a swap never blinks.
  const [loaded, setLoaded] = useState(() => decodedStills.has(src));

  return (
    <Image
      src={src}
      alt={alt}
      fill
      preload={preload}
      sizes="(max-width: 640px) 268px, 308px"
      onLoad={() => {
        decodedStills.add(src);
        setLoaded(true);
      }}
      className={cn(
        "object-cover transition-opacity duration-300 ease-soft",
        loaded ? "opacity-100" : "opacity-0"
      )}
    />
  );
};

const UpNextCard = ({
  item,
  preload = false,
}: {
  item: UpNextItem;
  preload?: boolean;
}) => {
  const [current, setCurrent] = useState(item);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1); // 1 = forward, -1 = undo.
  const [isMarking, setIsMarking] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  // The prop snapshot we last reconciled, so we can detect server refreshes
  // and fold them in during render (before paint) instead of in an effect.
  const [syncedItem, setSyncedItem] = useState(item);
  const busy = useRef(false);
  const lastMarked = useRef<{
    seasonNumber: number;
    episodeNumber: number;
  } | null>(null);

  /**
   * Index of the first episode that comes after the last episode we marked.
   * When the server refreshes after a mark, its list already starts at the next
   * episode, so this returns 0. If a stale list still contains the marked
   * episode, it skips past it — the card can only ever move forward, never
   * flash back to the episode the user just watched.
   */
  const indexAfterLastMark = (entry: UpNextItem) => {
    const marked = lastMarked.current;
    if (!marked) return 0;

    let start = 0;
    while (
      start < entry.nextEpisodes.length &&
      (entry.nextEpisodes[start].season_number < marked.seasonNumber ||
        (entry.nextEpisodes[start].season_number === marked.seasonNumber &&
          entry.nextEpisodes[start].episode_number <= marked.episodeNumber))
    ) {
      start++;
    }
    // Never index past the list (that would briefly render the empty state on
    // a stale refresh); keep the last available episode visible instead.
    return entry.nextEpisodes.length > 0
      ? Math.min(start, entry.nextEpisodes.length - 1)
      : 0;
  };

  // Apply a refreshed server snapshot during render so React never commits a
  // frame that pairs the new list with the old index. While a mark/unmark is
  // in flight we hold the current episode steady — the refresh lands when the
  // request finishes, so the next episode only appears once the button is done
  // loading.
  if (item !== syncedItem && !isMarking) {
    setSyncedItem(item);
    setCurrent(item);
    setEpisodeIndex(indexAfterLastMark(item));
  }

  const currentEpisode = current.nextEpisodes[episodeIndex] ?? null;
  const watchedOverall = current.watchedCount + episodeIndex;
  const episodesLeft =
    current.totalEpisodes > 0
      ? Math.max(0, current.totalEpisodes - watchedOverall)
      : 0;
  const progressPct =
    current.totalEpisodes > 0
      ? Math.min(
          100,
          Math.round((watchedOverall / current.totalEpisodes) * 100)
        )
      : 0;
  const remainingTime =
    episodesLeft > 0 && currentEpisode?.runtime
      ? episodesLeft * currentEpisode.runtime
      : 0;

  const seriesHref = `/shows/${item.title}-${item.seriesId}`;
  const watchHref = currentEpisode
    ? `${seriesHref}/episode/${item.seriesId}-${currentEpisode.season_number}-${currentEpisode.episode_number}`
    : seriesHref;
  const imdbHref = current.imdbId
    ? `https://www.imdb.com/title/${current.imdbId}`
    : null;

  const stillSrc = episodeImageSrc(currentEpisode, item.posterPath);

  // Warm the next episode's artwork so the slide that follows a mark shows the
  // new still instantly instead of flashing the card background.
  const upcomingSrc = episodeImageSrc(
    current.nextEpisodes[episodeIndex + 1] ?? null,
    item.posterPath
  );

  useEffect(() => {
    if (!upcomingSrc || decodedStills.has(upcomingSrc)) return;
    const image = new window.Image();
    image.onload = () => decodedStills.add(upcomingSrc);
    image.src = upcomingSrc;
    return () => {
      image.onload = null;
    };
  }, [upcomingSrc]);

  /**
   * Apply a refreshed item from the server. Keeps the optimistic episodeIndex
   * consistent: skip past anything we already marked so a slow response can't
   * rewind the card.
   */
  const applyRefreshedItem = (fresh: UpNextItem) => {
    setCurrent(fresh);
    setEpisodeIndex(indexAfterLastMark(fresh));
    busy.current = false;
  };

  const handleMarkWatched = async () => {
    if (!currentEpisode || busy.current) return;

    const episode = currentEpisode;
    busy.current = true;
    setIsMarking(true);
    lastMarked.current = {
      seasonNumber: episode.season_number,
      episodeNumber: episode.episode_number,
    };

    // Immediate feedback only — the burst plays and the button spins, but the
    // artwork deliberately stays on the current episode. The next episode is
    // revealed once the request finishes (below), so nothing advances while the
    // mark is still loading.
    setSlideDir(1);
    setBurstKey((key) => key + 1);

    try {
      // One server round-trip: mark + fresh card data (prefetched next ep).
      const res = await markEpisodeWatchedUpNext({
        episodeData: {
          seriesID: item.seriesId,
          episodeNumber: episode.episode_number,
          seasonNumber: episode.season_number,
        },
      });

      if (!res.success) {
        setIsMarking(false);
        lastMarked.current = null;
        busy.current = false;
        toast.error(res.message);
        return;
      }

      // Mark confirmed and the button is done loading — now swap in the next
      // episode.
      if (res.item) {
        applyRefreshedItem(res.item);
      } else {
        // The show completed and left the row. Leave the artwork as-is; the
        // carousel animates the whole card away on refresh instead of flashing
        // an empty state first.
        busy.current = false;
      }

      setIsMarking(false);
      toast.success(res.message, {
        description: `${item.title} • S${episode.season_number}E${episode.episode_number}`,
        action: {
          label: "Undo",
          onClick: () =>
            handleUndo({
              seasonNumber: episode.season_number,
              episodeNumber: episode.episode_number,
            }),
        },
      });
      // The action's revalidatePath already refreshes the dashboard. Issuing
      // router.refresh() here would re-render the whole route a second time
      // and flash its loading overlay.
    } catch (error) {
      console.error("Error marking episode:", error);
      setIsMarking(false);
      lastMarked.current = null;
      busy.current = false;
      toast.error("An error occurred");
    }
  };

  const handleUndo = async (
    episode: { seasonNumber: number; episodeNumber: number } | null
  ) => {
    if (busy.current) return;
    busy.current = true;
    setIsMarking(true);
    setSlideDir(-1);

    // Clear the mark floor up-front so any refresh landing mid-request keeps
    // the unmarked episode in place instead of skipping past it.
    const previousMarked = lastMarked.current;
    lastMarked.current = null;

    try {
      const res = await unmarkEpisodeUpNext({
        episodeData: {
          seriesID: item.seriesId,
          // With no explicit episode, the server undoes the most recently
          // watched one — so "Undo last mark" works after a reload too.
          ...(episode
            ? {
                episodeNumber: episode.episodeNumber,
                seasonNumber: episode.seasonNumber,
              }
            : {}),
        },
      });

      if (!res.success) {
        lastMarked.current = previousMarked;
        toast.error(res.message);
        return;
      }

      if (res.item) {
        setCurrent(res.item);
        setEpisodeIndex(0);
      }
      // If `res.item` is null the series left the row (e.g. its only watched
      // episode was undone) — the carousel removes this card on refresh.
      toast.success("Episode unmarked");
    } catch (error) {
      console.error("Error unmarking episode:", error);
      toast.error("An error occurred");
    } finally {
      setIsMarking(false);
      busy.current = false;
    }
  };

  const handleStatusChange = async (
    status: "WATCHING" | "COMPLETED" | "PLAN_TO_WATCH" | "DROPPED" | "ON_HOLD"
  ) => {
    const res = await setUpNextSeriesStatus(item.seriesId, status);
    if (res.success) {
      toast.success(res.message);
      // The action revalidates the dashboard and watchlist for us.
    } else {
      toast.error(res.message);
    }
  };

  const handleImdbLookup = async () => {
    if (imdbHref) {
      window.open(imdbHref, "_blank", "noopener");
      return;
    }
    const imdbId = await getUpNextImdbId(item.seriesId);
    if (imdbId) {
      window.open(`https://www.imdb.com/title/${imdbId}`, "_blank", "noopener");
    } else {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(
          `${item.title} imdb rating`
        )}`,
        "_blank",
        "noopener"
      );
    }
  };

  const handleTrailer = () => {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(
        `${item.title} S${currentEpisode?.season_number ?? 1}E${
          currentEpisode?.episode_number ?? 1
        } trailer`
      )}`,
      "_blank",
      "noopener"
    );
  };

  const compactEpisode = currentEpisode
    ? `S${currentEpisode.season_number}E${currentEpisode.episode_number}`
    : "";

  return (
    <article className="relative w-[268px] shrink-0 sm:w-[308px]">
      <div className="relative aspect-video overflow-hidden rounded-none bg-ink-600 shadow-elevated">
        {/* Episode slide — old episode eases out, next eases in. */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false} custom={slideDir}>
            {currentEpisode ? (
              <motion.div
                key={`${currentEpisode.season_number}-${currentEpisode.episode_number}`}
                custom={slideDir}
                // Pure slide (no opacity fade): the outgoing still stays solid
                // until it leaves and the incoming still is already decoded, so
                // the card never shows a blank frame mid-swap.
                initial={{ x: slideDir * 28 }}
                animate={{ x: 0 }}
                exit={{ x: slideDir * -28 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                  mass: 0.6,
                }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0">
                  {stillSrc ? (
                    <FadeImage
                      src={stillSrc}
                      alt={currentEpisode.name || item.title}
                      preload={preload}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-ink-600">
                      <EyeOff className="size-5 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink-600"
              >
                <EyeOff className="size-5 text-white/25" />
                <p className="text-xs text-white/35">No upcoming episodes</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle watched confirmation — quick and quiet. */}
        <AnimatePresence>
          {burstKey > 0 && (
            <motion.span
              key={burstKey}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <motion.span
                className="flex size-12 items-center justify-center rounded-full bg-primaryColor shadow-gold"
                initial={{ scale: 0.5, opacity: 0.9 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Check className="size-6 text-secondaryColor" strokeWidth={3} />
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Play affordance — fades in on hover, never blocks the card. */}
        {currentEpisode && (
          <Link
            href={watchHref}
            aria-label={`Play ${item.title} ${formatEpisodeLabel(currentEpisode)}`}
            className="absolute inset-0 z-10"
          />
        )}

        {/* Options — visible on touch, revealed on hover for desktop. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Episode options"
              className="absolute right-2 top-2 z-30 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/85 ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 hover:bg-black/65 hover:text-white"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[12rem] border-white/10 bg-ink-700 text-white"
          >
            <DropdownMenuItem
              onClick={handleMarkWatched}
              disabled={!currentEpisode || isMarking}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Check className="size-4" /> Mark S
              {currentEpisode?.season_number ?? "?"}E
              {currentEpisode?.episode_number ?? "?"} watched
            </DropdownMenuItem>
            <DropdownMenuItem
              // `null` lets the server resolve the most recently watched
              // episode, so this works even when the in-session mark is gone.
              onClick={() => handleUndo(lastMarked.current)}
              disabled={isMarking || watchedOverall === 0}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Undo2 className="size-4" /> Undo last mark
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleTrailer}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Play className="size-4" /> Watch trailer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleImdbLookup}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Star className="size-4" /> IMDb rating
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Link href={seriesHref}>
                <Info className="size-4" /> Open show
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => handleStatusChange("WATCHING")}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <Eye className="size-4" /> Set as watching
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("ON_HOLD")}
              className="cursor-pointer focus:bg-white/10 focus:text-white"
            >
              <BarChart2 className="size-4" /> Set on hold
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("DROPPED")}
              className="cursor-pointer focus:bg-red-400/20 focus:text-red-300"
            >
              <X className="size-4" /> Drop show
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Slim completion bar — the only progress chrome on the artwork. */}
        {current.totalEpisodes > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-black/35"
          >
            <motion.div
              className="h-full rounded-r-full bg-primaryColor"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
            />
          </div>
        )}
      </div>

      {/* Quiet, native-style metadata block. */}
      <div className="mt-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-white">
            {item.title}
          </h3>

          <motion.p
            key={
              currentEpisode
                ? `${currentEpisode.season_number}-${currentEpisode.episode_number}`
                : "none"
            }
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1 truncate text-[12.5px] text-white/45"
            title={currentEpisode ? formatEpisodeLabel(currentEpisode) : undefined}
          >
            {currentEpisode ? (
              <>
                <span className="font-semibold text-white/70">
                  {compactEpisode}
                </span>
                {currentEpisode.name ? (
                  <span> · {currentEpisode.name}</span>
                ) : null}
              </>
            ) : (
              "Finding next episode…"
            )}
          </motion.p>

          {current.totalEpisodes > 0 && (
            <p className="mt-1 truncate text-[11px] tabular-nums text-white/30">
              {watchedOverall} of {current.totalEpisodes}
              {remainingTime > 0
                ? ` · ${formatRemaining(remainingTime)} left`
                : ""}
            </p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={handleMarkWatched}
          disabled={isMarking || !currentEpisode}
          aria-label="Mark episode as watched"
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition-colors duration-200 hover:border-primaryColor hover:bg-primaryColor hover:text-secondaryColor",
            (isMarking || !currentEpisode) && "cursor-not-allowed opacity-50"
          )}
        >
          {isMarking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-[18px]" strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </article>
  );
};

export default UpNextCard;
