"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useEffect, useState } from "react";
import { setEpisodWatched } from "@/lib/actions/seriesActions";
import { Check, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Series } from "@/types/seriesT";
export const TMDB_API_KEY = "bb9cbfca59ec1d1fefd277beb3aa3d82";

const SeriesData = ({
  seriesId,
  posterPath,
  title,
  InitWatchedEpisodes,
  lastWatchedEpisode,
}: {
  seriesId: string;
  episodeNumber: number;
  seasonNumber: number;
  posterPath: string;
  title: string;
  InitWatchedEpisodes: number;
  lastWatchedEpisode: { episodeNumber: number; seasonNumber: number };
}) => {
  const [nextEpisodes, setNextEpisodes] = useState<
    {
      id: number;
      episode_number: number;
      season_number: number;
      name: string;
      overview: string;
      vote_average: number;
      runtime: number;
    }[]
  >([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [IsAction, setAction] = useState(false);
  const [WatchedEpisodes, setWatchedEpisodes] = useState(InitWatchedEpisodes);
  const [seriesData, setSeriesData] = useState<Series | null>(null);
  const [completed, setCompleted] = useState(false);

  // Effect for fetching series data
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}`
        );
        const data: Series = await response.json();

        setSeriesData(data);
      } catch (error) {
        console.error("Error fetching series data:", error);
      }
    };

    fetchSeriesData();
  }, [seriesId]);

  // Effect for fetching episodes after series data is loaded
  useEffect(() => {
    if (!seriesData) return;
    const fetchEpisodes = async () => {
      try {
        const newEpisodes: {
          id: number;
          episode_number: number;
          season_number: number;
          name: string;
          overview: string;
          vote_average: number;
          runtime: number;
        }[] = [];

        // Use Promise.all to fetch all seasons in parallel
        const seasonPromises = Array.from(
          { length: seriesData.number_of_seasons },
          async (_, index) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/tv/${seriesId}/season/${
                index + 1
              }?api_key=${TMDB_API_KEY}`
            );
            return await response.json();
          }
        );

        const seasons = await Promise.all(seasonPromises);

        for (const season of seasons) {
          newEpisodes.push(...season.episodes);
        }

        const filteredEpisodes = newEpisodes.filter((episode) => {
          if (!lastWatchedEpisode) return true;
          return (
            episode.season_number > lastWatchedEpisode.seasonNumber ||
            (episode.season_number === lastWatchedEpisode.seasonNumber &&
              episode.episode_number > lastWatchedEpisode.episodeNumber)
          );
        });

        setNextEpisodes(filteredEpisodes);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    };

    fetchEpisodes();
  }, [seriesId, seriesData, lastWatchedEpisode]);

  // Effect for checking completion status
  useEffect(() => {
    if (seriesData?.number_of_episodes) {
      const completionPercentage =
        (WatchedEpisodes / seriesData.number_of_episodes) * 100;
      setCompleted(completionPercentage === 100);
    }
  }, [WatchedEpisodes, seriesData]);

  const cuurentEpisode = nextEpisodes[currentEpisodeIndex];

  const handleNextEpisode = async () => {
    if (!cuurentEpisode) return;
    console.log(cuurentEpisode);

    setAction(true); // Disable UI button

    try {
      const episodeWatched = await setEpisodWatched({
        episodeData: {
          seriesID: seriesId.toString(),
          episodeNumber: cuurentEpisode.episode_number,
          seasonNumber: cuurentEpisode.season_number,
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
        console.log(episodeWatched);
      }
    } catch (error) {
      console.log("Error marking episode as watched:", error);
    } finally {
      setAction(false);
    }
  };

  return (
    <div className="px-2 w-1/4">
      <div className="flex flex-col bg-black rounded-sm h-[260px] text-white overflow-hidden gap-1 relative hover:perspective-distant duration-200">
        <div className="flex gap-2 relative">
          <button
            className={cn(
              "absolute top-2 right-1 h-[40px] bg-white rounded-full w-[40px] text-[#9f42c6] duration-400 flex items-center justify-center",
              IsAction || !cuurentEpisode || completed ? "opacity-30" : ""
            )}
            onClick={handleNextEpisode}
            disabled={IsAction || !cuurentEpisode || completed}
          >
            {IsAction ? <Loader className="animate-spin" /> : <Check />}
          </button>

          {/* Poster Image */}
          <Link
            href={`/shows/${title}-${seriesId}`}
            className="relative min-w-[160px] h-[260px]"
          >
            <div className="absolute inset-0 bg-black animate-fadeOut" />
            <Image
              src={posterPath || ""}
              alt={title || "Poster"}
              fill
              className="object-cover opacity-0 animate-fadeIn"
            />
          </Link>

          <div className="flex flex-col items-start py-2 w-full pr-2">
            {/* Title */}
            <div className=" max-w-[120px] whitespace-normal text-start">
              {title}
            </div>

            {/* Completion Status */}
            {completed ? (
              <p className="font-bold bg-[#bf80d9] text-[#fff8ff] px-2 flex items-center justify-center mt-2 rounded-md">
                Completed
              </p>
            ) : (
              <div className="flex flex-col overflow-hidden w-full relative z-50 my-2">
                {/* Season and Episode Number */}
                {cuurentEpisode && (
                  <div className="font-semibold  -z-10">
                    <div className="bg-white text-black w-fit px-1 rounded-sm ">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`season-${cuurentEpisode?.season_number}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="inline-flex"
                        >
                          S{cuurentEpisode?.season_number}
                        </motion.div>
                      </AnimatePresence>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`episode-${cuurentEpisode?.season_number}-${cuurentEpisode?.episode_number}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="inline-flex "
                        >
                          <span className="mx-1 text-gray-400">|</span>E
                          {cuurentEpisode?.episode_number}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`title-${cuurentEpisode?.season_number}-${cuurentEpisode?.episode_number}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="block w-full"
                      >
                        <span className="block text-amber-300">
                          {cuurentEpisode?.vote_average?.toFixed(1)} / 10
                        </span>
                        <span className="text-sm line-clamp-2">
                          {cuurentEpisode?.name}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {/* Episode Overview */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`title-${cuurentEpisode?.season_number}-${cuurentEpisode?.episode_number}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="block w-full"
                  >
                    <span className="whitespace-pre-wrap font-light text-sm   text-gray-400 line-clamp-4 capitalize">
                      {cuurentEpisode?.overview}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Progress Bar */}
            <Progress
              value={
                (WatchedEpisodes / (seriesData?.number_of_episodes ?? 0)) * 100
              }
              className="w-full mt-auto  "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesData;
