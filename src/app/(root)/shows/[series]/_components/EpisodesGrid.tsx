"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { StarIcon, Check, X } from "lucide-react";
import { Episode } from "@/types/seriesT";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkEpisodeWatchedBtn from "./MarkEpisodeWatchedBtn";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  markSeasonAsWatched,
  unmarkSeasonAsWatched,
} from "@/app/(root)/shows/actions";

interface EpisodesClientProps {
  episodes: {
    episodeData: Episode;
    isWatched: boolean;
  }[];
  seriesId: number;
  seriesImage: string;
}

export default function EpisodesGrid({
  episodes,
  seriesId,
  seriesImage,
}: EpisodesClientProps) {
  const [episodesState, setEpisodesState] =
    useState<{ episodeData: Episode; isWatched: boolean }[]>(episodes);
  const [seasonLoading, setSeasonLoading] = useState<Record<number, boolean>>(
    {}
  ); // Track loading state per season
  const router = useRouter();

  useEffect(() => {
    setEpisodesState(episodes);
  }, [episodes]);

  const uniqSeasons = Array.from(
    new Set(episodesState.map(({ episodeData }) => episodeData.season_number))
  ).sort((a, b) => a - b);
  const [activeSeason, setActiveSeason] = useState(uniqSeasons[0].toString()); // default active

  const handleSeasonWatchToggle = async (seasonNumber: number) => {
    // Check if all episodes in the season are currently watched
    const episodesInSeason = episodesState.filter(
      (ep) => ep.episodeData.season_number === seasonNumber
    );
    const allWatched = episodesInSeason.every((ep) => ep.isWatched);

    setSeasonLoading((prev) => ({ ...prev, [seasonNumber]: true }));
    try {
      let result;
      if (allWatched) {
        // Unmark the season
        result = await unmarkSeasonAsWatched({
          seriesID: seriesId.toString(),
          seasonNumber,
        });
      } else {
        // Mark the season
        result = await markSeasonAsWatched({
          seriesID: seriesId.toString(),
          seasonNumber,
        });
      }

      if (result.success) {
        // Update local state
        const updatedEpisodes = episodesState.map((ep) => {
          if (ep.episodeData.season_number === seasonNumber) {
            return { ...ep, isWatched: !allWatched }; // If all were watched, now they're not, and vice versa
          }
          return ep;
        });
        setEpisodesState(updatedEpisodes);

        toast.success(result.message);
        router.refresh(); // Refresh the page to ensure consistency
      } else {
        toast.error(
          result.message ||
            `Failed to ${allWatched ? "unmark" : "mark"} season as watched`
        );
      }
    } catch (error) {
      console.error(
        `Error ${allWatched ? "unmarking" : "marking"} season as watched:`,
        error
      );
      toast.error("An unexpected error occurred");
    } finally {
      setSeasonLoading((prev) => ({ ...prev, [seasonNumber]: false }));
    }
  };

  return (
    <Tabs
      defaultValue={uniqSeasons[0].toString()}
      className="w-full"
      onValueChange={(val) => setActiveSeason(val)}
    >
      <TabsList className="flex flex-wrap h-full w-full mt-4 ">
        {uniqSeasons.map((season) => {
          // Check if all episodes in the current season are watched
          const episodesInSeason = episodesState.filter(
            (ep) => ep.episodeData.season_number === season
          );
          const allWatched = episodesInSeason.every((ep) => ep.isWatched);

          return (
            <TabsTrigger
              key={season}
              value={season.toString()}
              className="w-[100px] font-bold relative"
            >
              <span> Season {season}</span>
              {/* Mark/Unmark Season as Watched Button */}
              {season === parseInt(activeSeason) && (
                <div className="absolute bottom-[90%] left-1/2 -translate-x-1/2">
                  <button
                    onClick={() => handleSeasonWatchToggle(season)}
                    disabled={
                      seasonLoading[season] ||
                      !markSeasonAsWatched ||
                      !unmarkSeasonAsWatched
                    }
                    className={`flex items-center justify-center rounded-full p-2 hover:opacity-80 disabled:opacity-50 transition
                     ${
                       !allWatched
                         ? "bg-primary border border-black"
                         : "bg-purple-600 hover:bg-purple-700"
                     }
                     `}
                  >
                    {seasonLoading[season] ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Check
                        className={`w-4 h-4 ${
                          allWatched ? "text-white" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                </div>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {uniqSeasons.map((season) => {
        return (
          <TabsContent key={season} value={season.toString()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-start gap-2">
              {episodesState
                .filter(
                  ({ episodeData }) => episodeData.season_number === season
                )
                .map(({ episodeData, isWatched }, i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        "relative w-full min-w-[200px] h-[250px]   overflow-hidden  bg-gradient-to-br from-white/20 to-white/5"
                      )}
                    >
                      <Image
                        src={`${IMAGE_BASE_URL}${
                          episodeData.still_path || seriesImage
                        }`}
                        alt={episodeData.name}
                        fill
                        quality={100}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover z-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 to-40% z-10" />

                      <div className="absolute bottom-0 left-0 right-0  z-20">
                        <div className="  px-2 py-2">
                          <div className="font-extrabold text-lg flex gap-2 text-white ">
                            <span>
                              {episodeData.season_number}x
                              {episodeData.episode_number}
                            </span>
                            <span className="truncate max-w-[120px]">
                              {episodeData.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-200 mt-1 flex items-center gap-2">
                            <span>
                              {episodeData.air_date
                                ? new Date(
                                    episodeData.air_date
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "2-digit",
                                  })
                                : "N/A"}
                            </span>
                            <span className="mx-1">•</span>
                            <span className="italic">
                              {episodeData.runtime}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex bg-[#2d2d2d] border-r  border-[#414040] h-10 ">
                      <MarkEpisodeWatchedBtn
                        episodeData={episodeData}
                        isWatched={isWatched}
                        seriesId={seriesId.toString()}
                        setPerviousWatched={setEpisodesState}
                        episodes={episodesState}
                      />
                      <span className="text-white p-2  hover:bg-[#ff5f06] duration-200">
                        <StarIcon strokeWidth={2} />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
