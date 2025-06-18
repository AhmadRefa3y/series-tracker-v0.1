"use client";
import { useTransition, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { setEpisodWatched } from "../../actions";
import { Episode } from "@/types/seriesT";

interface EpisodesClientProps {
  episodes: { episodeData: Episode; isWatched: boolean }[];
  seriesId: number;
}

export default function EpisodesClient({
  episodes,
  seriesId,
}: EpisodesClientProps) {
  const [optimisticWatched, setOptimisticWatched] = useState(
    episodes.map((ep) => ep.isWatched)
  );
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const handleMarkWatched =
    (idx: number, episodeData: Episode) => (e: React.FormEvent) => {
      e.preventDefault();
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
    <div className="flex  w-full flex-wrap  align-top">
      {episodes.map(({ episodeData }, i) => (
        <form
          key={i}
          onSubmit={handleMarkWatched(i, episodeData)}
          className="w-full sm:w-1/2 lg:w-1/3 p-1 py-0"
        >
          <button
            type="submit"
            disabled={optimisticWatched[i] || pendingIndex === i}
            className={cn(
              "group w-full  focus:outline-none transition-transform transform group-hover:scale-105 group-hover:shadow-2xl",
              (optimisticWatched[i] || pendingIndex === i) &&
                "opacity-60 cursor-not-allowed"
            )}
            tabIndex={0}
          >
            <div
              className={cn(
                "relative w-full min-w-[200px] h-[220px] rounded-sm  overflow-hidden  bg-gradient-to-br from-white/20 to-white/5"
              )}
            >
              <Image
                src={`${IMAGE_BASE_URL}${episodeData.still_path || ""}`}
                alt={episodeData.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
              <div className="absolute top-3 right-3 z-20">
                {optimisticWatched[i] ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 text-xs text-white shadow-glass font-semibold border border-white/30">
                    ✓ Watched
                  </span>
                ) : pendingIndex === i ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/30 text-xs text-white shadow-glass backdrop-blur">
                    Loading...
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/30 text-xs text-white shadow-glass backdrop-blur">
                    Mark as watched
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="backdrop-blur-md bg-white/20 rounded-lg px-3 py-2 shadow-glass">
                  <div className="font-extrabold text-lg flex gap-2 text-white drop-shadow">
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
          </button>
        </form>
      ))}
    </div>
  );
}
