"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { StarIcon, Check } from "lucide-react";
import { Episode } from "@/types/seriesT";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkEpisodeWatchedBtn from "./MarkEpisodeWatchedBtn";
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
  seriesSlug: string;
}

export default function EpisodesGrid({
  episodes,
  seriesId,
  seriesImage,
  seriesSlug,
}: EpisodesClientProps) {
  const [episodesState, setEpisodesState] =
    useState<{ episodeData: Episode; isWatched: boolean }[]>(episodes);
  const [seasonLoading, setSeasonLoading] = useState<Record<number, boolean>>(
    {}
  ); // Track loading state per season
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSeason, setActiveSeason] = useState("1");

  const episodesPerPage = 30;

  useEffect(() => {
    setEpisodesState(episodes);
  }, [episodes]);

  const uniqSeasons = Array.from(
    new Set(episodesState.map(({ episodeData }) => episodeData.season_number))
  ).sort((a, b) => a - b);
  // if (uniqSeasons.length === 0) {
  //   return (
  //     <div className="text-black flex items-center justify-center w-full">
  //       No Seasons found.
  //     </div>
  //   );
  // }
  // default active
  useEffect(() => {
    if (uniqSeasons.length > 0 && activeSeason === "1") {
      const watchedEpisodes = episodesState.filter((ep) => ep.isWatched);
      if (watchedEpisodes.length > 0) {
        const watchedSeasonNumbers = watchedEpisodes.map(
          (ep) => ep.episodeData.season_number
        );
        const maxWatchedSeason = Math.max(...watchedSeasonNumbers);

        // Check if the maxWatchedSeason is fully watched
        const episodesInMaxSeason = episodesState.filter(
          (ep) => ep.episodeData.season_number === maxWatchedSeason
        );
        const isMaxSeasonFullyWatched = episodesInMaxSeason.every(
          (ep) => ep.isWatched
        );

        if (isMaxSeasonFullyWatched) {
          // Find the next season in uniqSeasons
          const currentIndex = uniqSeasons.indexOf(maxWatchedSeason);
          if (currentIndex !== -1 && currentIndex < uniqSeasons.length - 1) {
            setActiveSeason(uniqSeasons[currentIndex + 1].toString());
          } else {
            setActiveSeason(maxWatchedSeason.toString());
          }
        } else {
          setActiveSeason(maxWatchedSeason.toString());
        }
      } else {
        setActiveSeason(uniqSeasons[0].toString());
      }
    }
  }, [uniqSeasons, activeSeason, episodesState]);

  // Get episodes for the active season
  const episodesInActiveSeason = episodesState.filter(
    ({ episodeData }) => episodeData.season_number === parseInt(activeSeason)
  );

  // Calculate pagination for the active season
  const totalPages = Math.ceil(episodesInActiveSeason.length / episodesPerPage);
  const startIndex = (currentPage - 1) * episodesPerPage;
  const endIndex = startIndex + episodesPerPage;
  const currentEpisodes = episodesInActiveSeason.slice(startIndex, endIndex);

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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of episodes grid
    const gridElement = document.getElementById("episodes-grid");
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reset to first page when season changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSeason]);

  if (uniqSeasons.length === 0) {
    return (
      <div className="text-black flex items-center justify-center w-full py-10">
        No Seasons found.
      </div>
    );
  }

  return (
    <Tabs
      value={activeSeason}
      className="w-full"
      onValueChange={(val) => setActiveSeason(val)}
    >
      <TabsList className="flex flex-wrap h-full w-full mt-4">
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
                  <span
                    onClick={() => handleSeasonWatchToggle(season)}
                    // disabled={
                    //   seasonLoading[season] ||
                    //   !markSeasonAsWatched ||
                    //   !unmarkSeasonAsWatched
                    // }
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
                  </span>
                </div>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {uniqSeasons.map((season) => {
        return (
          <TabsContent key={season} value={season.toString()}>
            <div id="episodes-grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-start sm:gap-2">
                {currentEpisodes.map(({ episodeData, isWatched }, i) => (
                  <Link
                    key={i}
                    href={`/shows/${seriesSlug}/episode/${seriesId}-${episodeData.season_number}-${episodeData.episode_number}`}
                    className="block"
                  >
                    <div className="group relative w-full min-w-[200px] h-[250px] overflow-hidden bg-gradient-to-br from-white/20 to-white/5 shadow-lg transition-all duration-300 hover:shadow-2xl">
                      <Image
                        src={`${
                          episodeData.still_path
                            ? `${IMAGE_BASE_URL}${episodeData.still_path}`
                            : seriesImage
                        } `}
                        alt={episodeData.name}
                        fill
                        quality={100}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover z-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 to-40% z-10" />

                      {/* Hover Overview Overlay */}
                      <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/80 overflow-hidden">
                        <div className="absolute inset-0 p-3 overflow-y-auto">
                          <div className="flex flex-col h-full justify-end pb-16">
                            <h4 className="font-bold text-white text-sm mb-2 line-clamp-2">
                              {episodeData.name}
                            </h4>
                            <p className="text-xs text-gray-300 line-clamp-4 leading-relaxed">
                              {episodeData.overview || "No overview available."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 z-20">
                        <div className="px-2 py-2">
                          <div className="font-extrabold text-lg flex items-end gap-2 text-white">
                            <span>
                              {episodeData.season_number}x
                              {episodeData.episode_number}
                            </span>
                            <span className="truncate hover:whitespace-normal">
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
                    <div className="flex bg-[#2d2d2d] border-r border-[#414040] h-10">
                      <div className="h-full" onClick={(e) => e.preventDefault()}>
                        <MarkEpisodeWatchedBtn
                          episodeData={episodeData}
                          isWatched={isWatched}
                          seriesId={seriesId.toString()}
                          setPerviousWatched={setEpisodesState}
                          episodes={episodesState}
                        />
                      </div>
                      <span className="text-white h-full flex items-center justify-center p-2 hover:bg-[#ff5f06] duration-200 transition-colors">
                        <StarIcon strokeWidth={2} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-[#ff5f06] text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
