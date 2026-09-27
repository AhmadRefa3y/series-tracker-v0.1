"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  minutes >= 24 * 60
    ? `${Math.round(minutes / (24 * 60))}d`
    : formatDuration(minutes);

const formatEpisodeLabel = (episode: Episode) => {
  const prefix = `S${episode.season_number} • E${episode.episode_number}`;
  return episode.name ? `${prefix} - ${episode.name}` : prefix;
};

const UpNextCard = ({
  item,
  preload = false,
}: {
  item: UpNextItem;
  preload?: boolean;
}) => {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [current, setCurrent] = useState(item);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1); // 1 = forward, -1 = undo.
  const [isMarking, setIsMarking] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const busy = useRef(false);
  const lastMarked = useRef<{
    seasonNumber: number;
    episodeNumber: number;
  } | null>(null);

  // Sync when the server sends genuinely new data (initial load / HMR).
  useEffect(() => {
    setCurrent(item);
  }, [item]);

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

  /**
   * Apply a refreshed item from the server. Keeps the optimistic episodeIndex
   * consistent: skip past anything we already marked so a slow response can't
   * rewind the card.
   */
  const applyRefreshedItem = (fresh: UpNextItem) => {
    setCurrent(fresh);
    const marked = lastMarked.current;
    let start = 0;
    if (marked) {
      while (
        start < fresh.nextEpisodes.length &&
        (fresh.nextEpisodes[start].season_number < marked.seasonNumber ||
          (fresh.nextEpisodes[start].season_number === marked.seasonNumber &&
            fresh.nextEpisodes[start].episode_number <= marked.episodeNumber))
      ) {
        start++;
      }
    }
    setEpisodeIndex(start);
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

    // 1. Optimistic animation first — advance the card instantly so the UI
    // never waits on the network. The slide, burst and progress bar all fire
    // before the request leaves the browser.
    setSlideDir(1);
    setBurstKey((key) => key + 1);
    setEpisodeIndex((index) => index + 1);

    try {
      // 2. One server round-trip: mark + fresh card data (prefetched next ep).
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

      if (res.item) {
        applyRefreshedItem(res.item);
      } else {
        // Show left the row (completed) — carousel animates it away.
        setCurrent((prev) => ({ ...prev, nextEpisodes: [] }));
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
      router.refresh(); // Sync other sections (history, stats) in background.
    } catch (error) {
      console.error("Error marking episode:", error);
      setIsMarking(false);
      lastMarked.current = null;
      busy.current = false;
      toast.error("An error occurred");
    }
  };

  const handleUndo = async (
    episode: { seasonNumber: number; episodeNumber: number }
  ) => {
    if (busy.current) return;
    busy.current = true;
    setIsMarking(true);
    setSlideDir(-1);

    try {
      const res = await unmarkEpisodeUpNext({
        episodeData: {
          seriesID: item.seriesId,
          episodeNumber: episode.episodeNumber,
          seasonNumber: episode.seasonNumber,
        },
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      lastMarked.current = null;
      if (res.item) {
        setCurrent(res.item);
        setEpisodeIndex(0);
      } else {
        // Row dropped the series while undoing — rebuild a minimal client-side
        // list so the card isn't stuck empty (server refetch fixes details).
        setCurrent((prev) => ({
          ...prev,
          watchedCount: Math.max(0, prev.watchedCount - 1),
          nextEpisodes: [
            {
              id: 0,
              name: `S${episode.seasonNumber} • E${episode.episodeNumber}`,
              overview: "",
              vote_average: 0,
              vote_count: 0,
              air_date: "",
              episode_number: episode.episodeNumber,
              episode_type: "standard",
              production_code: "",
              runtime: null,
              season_number: episode.seasonNumber,
              show_id: Number(prev.seriesId),
              still_path: null,
            },
            ...prev.nextEpisodes,
          ],
        }));
        setEpisodeIndex(0);
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

  const handleStatusChange = async (
    status: "WATCHING" | "COMPLETED" | "PLAN_TO_WATCH" | "DROPPED" | "ON_HOLD"
  ) => {
    const res = await setUpNextSeriesStatus(item.seriesId, status);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
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

  return (
    <article className="group/card relative w-[300px] shrink-0 sm:w-[340px]">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-[#1d1922] ring-1 ring-white/[0.06] transition-all duration-300 group-hover/card:ring-primaryColor/40">
        {/* Episode slide — old episode slides out, next slides in */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false} custom={slideDir} mode="popLayout">
            {currentEpisode ? (
              <motion.div
                key={`${currentEpisode.season_number}-${currentEpisode.episode_number}`}
                custom={slideDir}
                initial={{ opacity: 0, x: slideDir * 64, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: slideDir * -64, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
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
                  preload={preload}
                  sizes="(max-width: 640px) 300px, 340px"
                  className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1d1922]"
              >
                <EyeOff className="size-5 text-white/30" />
                <p className="text-xs text-white/40">No upcoming episodes</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Watched burst — check ring + expanding glow on mark */}
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

        {/* Play overlay on hover */}
        {currentEpisode && (
          <>
            <Link
              href={watchHref}
              aria-label={`Play ${item.title} ${formatEpisodeLabel(currentEpisode)}`}
              className="absolute inset-0 z-10"
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              initial={false}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-black/60 backdrop-blur-md ring-1 ring-white/20">
                <Play className="size-5 translate-x-0.5 text-white" />
              </span>
            </motion.div>
          </>
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

        {/* Runtime + remaining chips */}
        {currentEpisode && (currentEpisode.runtime || episodesLeft > 0) && (
          <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-20 flex items-center justify-between gap-2 rounded-md bg-black/80 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold text-white">
              {currentEpisode.runtime
                ? formatDuration(currentEpisode.runtime)
                : ""}
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

        {/* Dropdown actions */}
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
            className="min-w-[12rem] border-white/10 bg-[#1d1922] text-white"
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
              onClick={() => {
                const target =
                  lastMarked.current ??
                  (currentEpisode
                    ? {
                        seasonNumber: currentEpisode.season_number,
                        episodeNumber: currentEpisode.episode_number,
                      }
                    : null);
                if (target) handleUndo(target);
              }}
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
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
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

        {/* Series progress bar — Trakt-style completion indicator */}
        {current.totalEpisodes > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-black/60"
          >
            <motion.div
              className="h-full bg-primaryColor"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        )}
      </div>

      {/* Title + mark button */}
      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-white">
            {item.title}
          </h3>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={
                currentEpisode
                  ? `${currentEpisode.season_number}-${currentEpisode.episode_number}`
                  : "none"
              }
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-1 truncate text-[13px] text-white/50"
            >
              {currentEpisode
                ? formatEpisodeLabel(currentEpisode)
                : "Fetching next episode…"}
            </motion.p>
          </AnimatePresence>
          {current.totalEpisodes > 0 && (
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-primaryColor/90">
              {watchedOverall}/{current.totalEpisodes} episodes · {progressPct}%
            </p>
          )}
        </div>

        {/* Big mark-watched button — spinning loader while request runs */}
        <motion.button
          type="button"
          onClick={handleMarkWatched}
          disabled={isMarking || !currentEpisode}
          aria-label="Mark episode as watched"
          whileTap={reduceMotion ? undefined : { scale: 0.86 }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-primaryColor transition-colors duration-200 hover:bg-primaryColor hover:text-secondaryColor",
            (isMarking || !currentEpisode) && "cursor-not-allowed opacity-50"
          )}
        >
          {isMarking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-5" strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </article>
  );
};

export default UpNextCard;
