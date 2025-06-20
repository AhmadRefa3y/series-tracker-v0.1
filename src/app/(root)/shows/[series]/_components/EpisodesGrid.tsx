"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { StarIcon } from "lucide-react";
import { Episode } from "@/types/seriesT";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkEpisodeWatchedBtn from "./MarkEpisodeWatchedBtn";

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

  useEffect(() => {
    setEpisodesState(episodes);
  }, [episodes]);

  const uniqSeasons = Array.from(
    new Set(episodesState.map(({ episodeData }) => episodeData.season_number))
  ).sort((a, b) => a - b);

  return (
    <Tabs defaultValue={uniqSeasons[0].toString()} className="w-full">
      <TabsList className="flex flex-wrap h-full w-full">
        {uniqSeasons.map((season) => (
          <TabsTrigger
            key={season}
            value={season.toString()}
            className="w-[100px] font-bold"
          >
            Season {season}
          </TabsTrigger>
        ))}
      </TabsList>
      {uniqSeasons.map((season) => (
        <TabsContent key={season} value={season.toString()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-start gap-2">
            {episodesState
              .filter(({ episodeData }) => episodeData.season_number === season)
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
                          <span className="italic">{episodeData.runtime}m</span>
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
      ))}
    </Tabs>
  );
}
