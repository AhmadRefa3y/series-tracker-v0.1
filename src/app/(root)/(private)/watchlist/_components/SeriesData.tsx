"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  Play,
  RotateCcw,
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
import type { Episode } from "@/types/seriesT";
import {
  markEpisodeWatchedFast,
  unmarkEpisodeWatchedFast,
  updateSeriesStatus,
} from "../actions";

interface SeriesDataProps {
  seriesId: string;
  posterPath: string;
  title: string;
  initWatchedEpisodes: number;
  totalEpisodes: number;
  nextEpisodes: Episode[];
  status?: string;
  /** Hide-on-complete behaviour for the "Watching" tab. */
  hideWhenComplete?: boolean;
}

const SeriesData = ({
  seriesId,
  posterPath,
  title,
  initWatchedEpisodes,
  totalEpisodes,
  nextEpisodes: initialNextEpisodes,
  status,
  hideWhenComplete = false,
}: SeriesDataProps) => {
  const router = useRouter();

  const [nextEpisodes, setNextEpisodes] = useState(initialNextEpisodes);
  const [watchedEpisodes, setWatchedEpisodes] = useState(initWatchedEpisodes);
  const [isMarking, setIsMarking] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const busy = useRef(false);

  // Sync with fresh server props after router.refresh().
  useEffect(() => {
    setWatchedEpisodes(initWatchedEpisodes);
    setNextEpisodes(initialNextEpisodes);
    busy.current = false;
    setIsMarking(false);

    if (
      hideWhenComplete &&
      totalEpisodes > 0 &&
      initWatchedEpisodes >= totalEpisodes
    ) {
      const statusFilter =
        new URLSearchParams(window.location.search).get("status") || "watching";
      if (statusFilter === "watching") setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  }, [initWatchedEpisodes, initialNextEpisodes, totalEpisodes, hideWhenComplete]);

  const currentEpisode = nextEpisodes[0] ?? null;
  const isCompleted = totalEpisodes > 0 && watchedEpisodes >= totalEpisodes;
  const progressPct =
    totalEpisodes > 0
      ? Math.min(100, Math.round((watchedEpisodes / totalEpisodes) * 100))
      : 0;

  const seriesHref = `/shows/${title}-${seriesId}`;

  /** Apply the fast-action payload: counts + next episodes in one shot. */
  const applyFresh = (fresh: {
    watchedCount: number;
    isCompleted: boolean;
    nextEpisodes: {
      season_number: number;
      episode_number: number;
      name?: string;
    }[];
  }) => {
    setWatchedEpisodes(fresh.watchedCount);
    setNextEpisodes(fresh.nextEpisodes as Episode[]);
    busy.current = false;
    setIsMarking(false);

    if (
      hideWhenComplete &&
      fresh.isCompleted &&
      (new URLSearchParams(window.location.search).get("status") ||
        "watching") === "watching"
    ) {
      setIsHidden(true);
    }
  };

  const handleMarkWatched = async () => {
    if (!currentEpisode || busy.current) return;
    const episode = currentEpisode;

    busy.current = true;
    setIsMarking(true);

    // 1. Optimistic: slide to the next episode instantly, burst, advance bar.
    setSlideDir(1);
    setBurstKey((key) => key + 1);
    setWatchedEpisodes((count) => count + 1);
    setNextEpisodes((eps) => eps.slice(1));

    try {
      // 2. Single round-trip: mark + refreshed card data.
      const res = await markEpisodeWatchedFast({
        episodeData: {
          seriesID: seriesId,
          episodeNumber: episode.episode_number,
          seasonNumber: episode.season_number,
        },
      });

      if (!res.success) {
        // Roll back the optimistic advance.
        setWatchedEpisodes((count) => Math.max(0, count - 1));
        setNextEpisodes(initialNextEpisodes);
        busy.current = false;
        setIsMarking(false);
        toast.error(res.message);
        return;
      }

      if (res.series) applyFresh(res.series);
      else {
        busy.current = false;
        setIsMarking(false);
      }

      toast.success(res.message, {
        description: `${title} • S${episode.season_number}E${episode.episode_number}`,
        action: {
          label: "Undo",
          onClick: () =>
            handleUnmark({
              seasonNumber: episode.season_number,
              episodeNumber: episode.episode_number,
            }),
        },
      });
      router.refresh(); // Sync the rest of the page in the background.
    } catch (error) {
      console.error("Error marking episode:", error);
      setWatchedEpisodes((count) => Math.max(0, count - 1));
      setNextEpisodes(initialNextEpisodes);
      busy.current = false;
      setIsMarking(false);
      toast.error("An error occurred");
    }
  };

  /** Server-side undo: resolves the latest watched episode itself. */
  const handleUnmarkLast = async () => {
    if (busy.current) return;
    busy.current = true;
    setIsMarking(true);
    setSlideDir(-1);

    try {
      const res = await unmarkEpisodeWatchedFast({ seriesID: seriesId });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      if (res.series) applyFresh(res.series);
      else {
        busy.current = false;
        setIsMarking(false);
      }
      toast.success("Episode unmarked");
      router.refresh();
    } catch (error) {
      console.error("Error unmarking episode:", error);
      toast.error("An error occurred");
    } finally {
      setIsMarking(false);
      busy.current = false;
    }
  };

  const handleUnmark = async (episode: {
    seasonNumber: number;
    episodeNumber: number;
  }) => {
    if (busy.current) return;
    busy.current = true;
    setIsMarking(true);
    setSlideDir(-1);

    try {
      const res = await unmarkEpisodeWatchedFast({
        seriesID: seriesId,
        episode: {
          episodeNumber: episode.episodeNumber,
          seasonNumber: episode.seasonNumber,
        },
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      if (res.series) {
        applyFresh(res.series);
      } else {
        busy.current = false;
        setIsMarking(false);
      }
      toast.success("Episode unmarked");
      router.refresh();
    } catch (error) {
      console.error("Error unmarking episode:", error);
      toast.error("An error occurred");
    } finally {
      setIsMarking(false);
      busy.current = false;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    // Optimistic hide for status moves that remove the card from this tab.
    if (newStatus === "DROPPED" || newStatus === "COMPLETED") {
      setIsHidden(true);
    }

    try {
      const res = await updateSeriesStatus(seriesId, newStatus);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        setIsHidden(false);
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error changing status:", error);
      setIsHidden(false);
      toast.error("Failed to update status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (isHidden) return null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={
        isHidden
          ? { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="group relative w-[176px] shrink-0 sm:w-[196px]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#1d1922] ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-primaryColor/50">
        <Link href={seriesHref} aria-label={title} className="absolute inset-0 z-10" />
        <Image
          src={posterPath || "/no-image-available.webp"}
          alt={title}
          fill
          sizes="196px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover gradient with next-episode info */}
        {!isCompleted && status !== "DROPPED" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 pb-9 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={currentEpisode?.id ?? "none"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="truncate text-[12px] font-bold text-primaryColor"
              >
                {currentEpisode
                  ? `S${currentEpisode.season_number}E${currentEpisode.episode_number} · ${currentEpisode.name}`
                  : "No episodes left"}
              </motion.p>
            </AnimatePresence>
            {currentEpisode?.vote_average ? (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
                <Star className="size-3 fill-current" />
                {currentEpisode.vote_average.toFixed(1)}/10
              </p>
            ) : null}
          </div>
        )}

        {/* Dropped veil */}
        {status === "DROPPED" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
            <span className="rounded bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-tight text-white shadow-xl">
              Dropped
            </span>
          </div>
        )}

        {/* Completed badge */}
        {isCompleted && status !== "DROPPED" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1 text-primaryColor"
            >
              <Check className="size-10" strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-tight">
                Done
              </span>
            </motion.span>
          </div>
        )}

        {/* Watched burst */}
        {burstKey > 0 && (
          <motion.span
            key={burstKey}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.span
              className="flex size-16 items-center justify-center rounded-full bg-primaryColor"
              initial={{ scale: 0.4, opacity: 0.95 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Check className="size-8 text-secondaryColor" strokeWidth={3} />
            </motion.span>
          </motion.span>
        )}

        {/* Progress bar at the poster base */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-black/60"
        >
          <motion.div
            className="h-full bg-primaryColor"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {/* Episode slide animation layer — the next episode label slides in */}
        <AnimatePresence custom={slideDir} initial={false}>
          {slideDir !== 1 && !isHidden && (
            <motion.span
              key="undo-slide"
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              className="absolute left-2 top-2 z-30 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white"
            >
              S{currentEpisode?.season_number}E{currentEpisode?.episode_number}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Title + counter */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <Link
          href={seriesHref}
          className="min-w-0 flex-1 truncate text-[13px] font-bold leading-tight text-white hover:text-primaryColor"
        >
          {title}
        </Link>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-tight text-primaryColor">
          {isCompleted ? "Done" : `${watchedEpisodes}/${totalEpisodes || "?"}`}
        </span>
      </div>

      {/* Action bar */}
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.03]">
        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Series options"
              disabled={isChangingStatus}
              className="flex w-9 items-center justify-center border-r border-white/[0.07] text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {isChangingStatus ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreVertical className="size-4" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[11rem] border-white/10 bg-[#1d1922] text-white"
          >
            {status === "DROPPED" ? (
              <DropdownMenuItem
                onClick={() => handleStatusChange("WATCHING")}
                className="cursor-pointer focus:bg-white/10 focus:text-white"
              >
                <RotateCcw className="size-4" /> Restore to watching
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("WATCHING")}
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                >
                  <Eye className="size-4" /> Watching
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("ON_HOLD")}
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                >
                  <EyeOff className="size-4" /> On hold
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => handleStatusChange("DROPPED")}
                  className="cursor-pointer focus:bg-red-400/20 focus:text-red-300"
                >
                  <X className="size-4" /> Drop show
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mark watched */}
        <motion.button
          type="button"
          onClick={handleMarkWatched}
          disabled={isMarking || !currentEpisode || isCompleted || status === "DROPPED"}
          aria-label="Mark next episode as watched"
          title={
            currentEpisode
              ? `Mark S${currentEpisode.season_number}E${currentEpisode.episode_number} watched`
              : "No episodes left"
          }
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-[12px] font-bold text-primaryColor transition-colors duration-200 hover:bg-primaryColor hover:text-secondaryColor",
            (isMarking || !currentEpisode || isCompleted || status === "DROPPED") &&
              "cursor-not-allowed opacity-40"
          )}
        >
          {isMarking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Check className="size-4" strokeWidth={3} />
              {currentEpisode
                ? `S${currentEpisode.season_number}E${currentEpisode.episode_number}`
                : "—"}
            </>
          )}
        </motion.button>

        {/* Quick undo — server resolves the latest watched episode itself */}
        <button
          type="button"
          onClick={() => handleUnmarkLast()}
          disabled={isMarking || watchedEpisodes === 0}
          aria-label="Undo last mark"
          title="Undo last mark"
          className="flex w-9 items-center justify-center border-l border-white/[0.07] text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <Undo2 className="size-4" />
        </button>

        {/* Open episode page */}
        <Link
          href={
            currentEpisode
              ? `${seriesHref}/episode/${seriesId}-${currentEpisode.season_number}-${currentEpisode.episode_number}`
              : seriesHref
          }
          aria-label="Open next episode"
          className="flex w-9 items-center justify-center border-l border-white/[0.07] text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <Play className="size-4" />
        </Link>
      </div>
    </motion.article>
  );
};

export default SeriesData;
