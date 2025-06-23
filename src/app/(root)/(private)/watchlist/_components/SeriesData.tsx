"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Check, Loader, Text } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Series } from "@/types/seriesT";
import { markEpisodWatched } from "../actions";

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
}

const SeriesData = ({
  seriesId,
  posterPath,
  title,
  InitWatchedEpisodes,
  seriesData,
  nextEpisodes,
}: SeriesDataProps) => {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isAction, setAction] = useState(false);
  const [watchedEpisodes, setWatchedEpisodes] = useState(InitWatchedEpisodes);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (seriesData?.number_of_episodes) {
      const completionPercentage =
        (watchedEpisodes / seriesData.number_of_episodes) * 100;
      setCompleted(completionPercentage === 100);
    }
  }, [watchedEpisodes, seriesData]);

  const currentEpisode = nextEpisodes[currentEpisodeIndex];

  const handleNextEpisode = async () => {
    if (!currentEpisode) return;

    setAction(true);

    try {
      const episodeWatched = await markEpisodWatched({
        episodeData: {
          seriesID: seriesId.toString(),
          episodeNumber: currentEpisode.episode_number,
          seasonNumber: currentEpisode.season_number,
        },
      });

      if (episodeWatched.success) {
        setWatchedEpisodes((prev) => prev + 1);
        if (nextEpisodes[currentEpisodeIndex + 1]) {
          setCurrentEpisodeIndex((prev) => prev + 1);
        } else {
          setCompleted(true);
        }
      } else {
        throw new Error("Failed to mark episode as watched");
      }
    } catch (error) {
      console.log("Error marking episode as watched:", error);
    } finally {
      setAction(false);
    }
  };

  return (
    <div className="px-1 w-1/6   ">
      <div className="flex flex-col bg-black h-[350px] text-white overflow-hidden group relative hover:perspective-distant duration-200 ">
        <div className="flex flex-col relative flex-1 h-[310px] overflow-hidden ">
          {/* Poster Image */}
          <div className="relative   h-full flex flex-col">
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

          {!completed && (
            <div className="flex flex-col items-start py-2 w-full pr-2  z-10 absolute bottom-0 opacity-0 duration-200 group-hover:opacity-100">
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
                        className="block w-full"
                      >
                        <span className="text-sm line-clamp-2">
                          {currentEpisode?.name}
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
                    <span className="whitespace-pre-wrap font-light text-sm max-h-full capitalize line-clamp-[4]">
                      {currentEpisode?.overview}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
        <Progress
          value={
            seriesData?.number_of_episodes
              ? (watchedEpisodes / seriesData.number_of_episodes) * 100
              : 0
          }
          className="w-full mt-auto rounded-none"
        />
        <div className="flex items-center bg-[#2d2d2d] border-r  border-[#414040] h-[40px] ">
          <button
            className={cn(
              "h-full hover:bg-primaryColor hover:text-secondaryColor  duration-200 p-2 flex items-center justify-center",
              isAction || !currentEpisode || completed ? "opacity-30" : ""
            )}
            onClick={handleNextEpisode}
            disabled={isAction || !currentEpisode || completed}
          >
            {isAction ? <Loader className="animate-spin" /> : <Check />}
          </button>
          <button className="text-white p-2  hover:bg-[#ff5f06] duration-200">
            <Text strokeWidth={2} />
          </button>
          {/* <span className="block text-amber-300 ">
            {currentEpisode?.vote_average?.toFixed(1)} / 10
          </span> */}
          {completed ? (
            <p className=" text-primaryColor px-2 ml-auto normal-case flex items-center justify-center ">
              Finished
            </p>
          ) : (
            <div className="text-primaryColor ml-auto px-2 font-bold ">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`season-${currentEpisode?.season_number}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex"
                >
                  S{currentEpisode?.season_number}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`episode-${currentEpisode?.season_number}-${currentEpisode?.episode_number}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex"
                >
                  <span className="mx-1 text-gray-400">|</span>E
                  {currentEpisode?.episode_number}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesData;
