"use client";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { setEpisodWatched } from "../../actions";
import { Episode } from "@/types/seriesT";
import { Check, Loader, StarIcon, Text } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [episodesState, setEpisodesState] =
    useState<{ episodeData: Episode; isWatched: boolean }[]>(episodes);
  return (
    <div className="  w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-start">
      {episodesState.map(({ episodeData, isWatched }, i) => (
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
  );
}

const MarkEpisodeWatchedBtn = ({
  episodeData,
  isWatched,
  seriesId,
  episodes,
  setPerviousWatched,
}: {
  episodeData: Episode;
  isWatched: boolean;
  seriesId: string;
  setPerviousWatched: Dispatch<
    SetStateAction<
      {
        episodeData: Episode;
        isWatched: boolean;
      }[]
    >
  >;
  episodes: { episodeData: Episode; isWatched: boolean }[];
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleMarkWatched = async () => {
    setLoading(true);
    const res = await setEpisodWatched({
      episodeData: {
        seriesID: seriesId.toString(),
        episodeNumber: episodeData.episode_number,
        seasonNumber: episodeData.season_number,
      },
    });
    console.log(res);

    if (res.success) {
      const newEpisodes = episodes.map((episode) => {
        if (episode.episodeData.episode_number <= episodeData.episode_number) {
          return { episodeData: episode.episodeData, isWatched: true };
        } else {
          return episode;
        }
      });
      setPerviousWatched(newEpisodes);
    } else {
      console.log(res.error);
      toast.error("Failed to mark episode as watched");
    }
    setLoading(false);
  };
  return (
    <Button
      className={cn(
        "text-white p-2 hover:bg-[#6c3384] duration-200 rounded-none m-0 h-full bg-transparent",
        isWatched && "bg-[#6c3384]"
      )}
      onClick={handleMarkWatched}
      disabled={isWatched || loading}
    >
      {loading ? (
        <Loader className="animate-spin" />
      ) : isWatched ? (
        <Check strokeWidth={4} />
      ) : (
        <Text strokeWidth={4} />
      )}
    </Button>
  );
};
