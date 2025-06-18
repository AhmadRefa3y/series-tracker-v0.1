"use client";
import { useTransition, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { setEpisodWatched } from "../../actions";
import { Episode } from "@/types/seriesT";
import { Check, Loader, StarIcon, Text } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EpisodesClientProps {
  episodes: { episodeData: Episode; isWatched: boolean }[];
  seriesId: number;
  seriesImage: string;
}

export default function EpisodesClient({
  episodes,
  seriesId,
  seriesImage,
}: EpisodesClientProps) {
  const [optimisticWatched, setOptimisticWatched] = useState(
    episodes.map((ep) => ep.isWatched)
  );
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const [, startTransition] = useTransition();

  const handleMarkWatched =
    (idx: number, episodeData: Episode) => (e: React.FormEvent) => {
      e.preventDefault();
      console.log("handleMarkWatched");

      setOptimisticWatched((prev) => {
        return prev.map((watched, i) => (i <= idx ? true : watched));
      });
      setPendingIndex(idx);
      startTransition(async () => {
        await setEpisodWatched({
          episodeData: {
            seriesID: seriesId.toString(),
            episodeNumber: episodeData.episode_number,
            seasonNumber: episodeData.season_number,
          },
        });
        setPendingIndex(null);
      });
    };

  return (
    <div className="  w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-start">
      {episodes.map(({ episodeData }, i) => (
        <div key={i}>
          <div
            className={cn(
              "relative w-full min-w-[200px] h-[250px]   overflow-hidden  bg-gradient-to-br from-white/20 to-white/5"
            )}
          >
            <Image
              src={`${IMAGE_BASE_URL}${episodeData.still_path || seriesImage}`}
              alt={episodeData.name}
              fill
              className="object-cover z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 to-40% z-10" />

            <div className="absolute bottom-0 left-0 right-0  z-20">
              <div className="  px-2 py-2">
                <div className="font-extrabold text-lg flex gap-2 text-white ">
                  <span>
                    {episodeData.season_number}x{episodeData.episode_number}
                  </span>
                  <span className="truncate max-w-[120px]">
                    {episodeData.name}
                  </span>
                </div>
                <div className="text-xs text-gray-200 mt-1 flex items-center gap-2">
                  <span>
                    {new Date(episodeData.air_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      }
                    )}
                  </span>
                  <span className="mx-1">•</span>
                  <span className="italic">{episodeData.runtime}m</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex bg-[#2d2d2d] border-r  border-[#414040] h-10 ">
            {/* <span className="text-white p-2  hover:bg-[#0082ce] duration-200">
              <Check strokeWidth={4} />
            </span> */}
            <Button
              className={cn(
                "text-white p-2 hover:bg-[#6c3384] duration-200 rounded-none m-0 h-full bg-transparent",
                optimisticWatched[i] && "bg-[#6c3384]"
              )}
              onClick={handleMarkWatched(i, episodeData)}
              disabled={pendingIndex === i}
            >
              {pendingIndex === i ? (
                <Loader className="animate-spin" />
              ) : optimisticWatched[i] ? (
                <Check strokeWidth={4} />
              ) : (
                <Text strokeWidth={4} />
              )}
            </Button>
            <span className="text-white p-2  hover:bg-[#ff5f06] duration-200">
              <StarIcon strokeWidth={2} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
