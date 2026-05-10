"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Check, Loader2, Text, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Series } from "@/types/seriesT";
import { markEpisodWatched, updateSeriesStatus } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Episode = {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  vote_average: number;
  runtime: number;
};

interface SeriesDataProps {
  seriesId: string;
  episodeNumber: number;
  seasonNumber: number;
  posterPath: string;
  title: string;
  InitWatchedEpisodes: number;
  lastWatchedEpisode: { episodeNumber: number; seasonNumber: number } | null;
  seriesData: Series | null;
  nextEpisodes: Episode[];
  status?: string;
}

const SeriesData = ({
  seriesId,
  posterPath,
  title,
  InitWatchedEpisodes,
  seriesData,
  nextEpisodes,
  status,
}: SeriesDataProps) => {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isOptimisticallyHidden, setIsOptimisticallyHidden] = useState(false);
  const [watchedEpisodes, setWatchedEpisodes] = useState(InitWatchedEpisodes);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (seriesData?.number_of_episodes) {
      const completionPercentage =
        (watchedEpisodes / seriesData.number_of_episodes) * 100;
      const isNowCompleted = completionPercentage >= 100;
      setCompleted(isNowCompleted);

      // Optimistic Hide: If we are in the "watching" tab and it just finished, hide it instantly
      if (isNowCompleted && (window.location.search.includes("status=watching") || !window.location.search.includes("status="))) {
        setIsOptimisticallyHidden(true);
      }
    }
  }, [watchedEpisodes, seriesData]);

  const currentEpisode = nextEpisodes[currentEpisodeIndex];

  const handleNextEpisode = async () => {
    if (!currentEpisode) return;

    setIsMarkingWatched(true);

    try {
      const res = await markEpisodWatched({
        episodeData: {
          seriesID: seriesId.toString(),
          episodeNumber: currentEpisode.episode_number,
          seasonNumber: currentEpisode.season_number,
        },
      });

      if (res.success) {
        setWatchedEpisodes((prev) => prev + 1);
        if (nextEpisodes[currentEpisodeIndex + 1]) {
          setCurrentEpisodeIndex((prev) => prev + 1);
        } else {
          setCompleted(true);
        }
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error marking episode:", error);
      toast.error("An error occurred");
    } finally {
      setIsMarkingWatched(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Optimistic Update: Hide the card immediately
    setIsOptimisticallyHidden(true);
    setIsChangingStatus(true);

    try {
      const res = await updateSeriesStatus(seriesId, newStatus);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        // Rollback if failed
        setIsOptimisticallyHidden(false);
        toast.error(res.message);
      }
    } catch (error) {
        console.error("Error changing status:", error);
        setIsOptimisticallyHidden(false);
        toast.error("Failed to update status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (isOptimisticallyHidden) return null;

  return (
    <div className="px-1 w-1/6 min-w-[175px] h-[350px] overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
      <div className="flex flex-col bg-black h-full  text-white overflow-hidden group relative hover:perspective-distant duration-200 ">
        <div className="flex flex-col relative flex-1 h-[310px] overflow-hidden ">
          {/* Poster Image */}
          <div className="relative h-full flex flex-col">
            <Link
              href={`/shows/${title}-${seriesId}`}
              className="relative min-w-[160px] h-full"
            >
              <div className="absolute inset-0 bg-black animate-fadeOut" />
              <Image
                src={posterPath || ""}
                alt={title || "Poster"}
                fill
                className="object-cover opacity-0 animate-fadeIn"
              />
            </Link>
          </div>

          {!completed && status !== "DROPPED" && (
            <div className="flex flex-col items-start py-2 w-full pr-2  z-10 absolute bottom-0 md:opacity-0 duration-200 md:group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-10% via-black/70 to-100%  to-black " />
              <div className="flex flex-col overflow-hidden w-full  z-50 h-fit pl-2 ">
                {currentEpisode && (
                  <div className="font-semibold -z-10 flex-col flex gap-2 items-start text-primaryColor">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`title-${currentEpisode?.season_number}-${currentEpisode?.episode_number}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className=" w-full flex justify-between gap-1 "
                      >
                        <span className="text-sm line-clamp-4">
                          {currentEpisode?.name}
                        </span>
                        <span className=" text-red-500 text-nowrap ">
                          {currentEpisode?.vote_average?.toFixed(1)} / 10
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`title-${currentEpisode?.season_number}-${currentEpisode?.episode_number}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="block w-full"
                  >
                    <span className="whitespace-pre-wrap font-light text-sm max-h-full capitalize line-clamp-[4] md:hover:line-clamp-[10] ">
                      {currentEpisode?.overview}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {status === "DROPPED" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 backdrop-blur-[1px]">
                <span className="bg-red-600 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded shadow-xl tracking-tighter">Dropped</span>
            </div>
          )}
        </div>
        <Progress
          value={
            seriesData?.number_of_episodes
              ? (watchedEpisodes / seriesData.number_of_episodes) * 100
              : 0
          }
          className="w-full mt-auto rounded-none h-1"
        />
        <div className="flex items-center bg-[#2d2d2d] border-r  border-[#414040] h-[40px] ">
          {status === "DROPPED" ? (
             <button
                className="h-full w-10 hover:bg-emerald-600 hover:text-white duration-200 p-2 flex items-center justify-center border-r border-[#414040]"
                onClick={() => handleStatusChange("WATCHING")}
                disabled={isChangingStatus || isMarkingWatched}
                title="Restore to Watching"
             >
                {isChangingStatus ? <Loader2 className="animate-spin size-4 text-white" /> : <RotateCcw size={18} />}
             </button>
          ) : (
            <button
                className="h-full w-10 hover:bg-red-600 hover:text-white duration-200 p-2 flex items-center justify-center border-r border-[#414040]"
                onClick={() => handleStatusChange("DROPPED")}
                disabled={isChangingStatus || isMarkingWatched || completed}
                title="Drop Series"
            >
                {isChangingStatus ? <Loader2 className="animate-spin size-4 text-white" /> : <XCircle size={18} />}
            </button>
          )}

          <button
            className={cn(
              "h-full flex-grow hover:bg-primaryColor hover:text-secondaryColor duration-200 p-2 flex items-center justify-center transition-opacity",
              isMarkingWatched || !currentEpisode || completed || status === "DROPPED" ? "opacity-30" : "opacity-100",
              isChangingStatus && "cursor-not-allowed" // Only disable cursor, keep opacity high if not marking
            )}
            onClick={handleNextEpisode}
            disabled={isMarkingWatched || isChangingStatus || !currentEpisode || completed || status === "DROPPED"}
          >
            {isMarkingWatched ? <Loader2 className="animate-spin size-4" /> : <Check />}
          </button>
          
          <button className="h-full text-white p-2 hover:bg-[#ff5f06] duration-200 border-l border-[#414040]">
            <Text strokeWidth={2} size={18} />
          </button>

          {completed ? (
            <p className="text-primaryColor px-2 ml-auto text-[10px] font-black uppercase flex items-center justify-center tracking-tighter">
              Done
            </p>
          ) : (
            <div className="text-primaryColor ml-auto px-2 text-xs font-black tracking-tighter">
              {currentEpisode ? `S${currentEpisode.season_number}E${currentEpisode.episode_number}` : "--"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesData;
