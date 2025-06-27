"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Episode } from "@/types/seriesT";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { markEpisodWatched } from "@/app/(root)/(private)/watchlist/actions";

interface MarkEpisodeWatchedBtnProps {
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
}

const MarkEpisodeWatchedBtn = ({
  episodeData,
  isWatched,
  seriesId,
  episodes,
  setPerviousWatched,
}: MarkEpisodeWatchedBtnProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleUnmarkWatched = async () => {
    setLoading(true);
    try {
      const { unMarkEpisodeWatched } = await import("../../actions");
      const res = await unMarkEpisodeWatched({
        episodeData: {
          seriesID: seriesId.toString(),
          episodeNumber: episodeData.episode_number,
          seasonNumber: episodeData.season_number,
        },
      });
      if (res.success) {
        const newEpisodes = episodes.map((episode) => {
          if (
            episode.episodeData.episode_number === episodeData.episode_number &&
            episode.episodeData.season_number === episodeData.season_number
          ) {
            return { episodeData: episode.episodeData, isWatched: false };
          } else {
            return episode;
          }
        });
        setPerviousWatched(newEpisodes);
        toast.success("Episode removed from watch list");
        router.refresh();
      } else {
        toast.error("Failed to remove episode from watch list");
      }
    } catch {
      toast.error("An error occurred");
    }
    setLoading(false);
  };

  const handleMarkWatchedSingle = async () => {
    console.log("Marking episode as watched:", episodeData.episode_number);

    setLoading(true);
    const res = await markEpisodWatched({
      episodeData: {
        seriesID: seriesId.toString(),
        episodeNumber: episodeData.episode_number,
        seasonNumber: episodeData.season_number,
      },
    });
    if (res.success) {
      const newEpisodes = episodes.map((episode) => {
        if (
          episode.episodeData.episode_number === episodeData.episode_number &&
          episode.episodeData.season_number === episodeData.season_number
        ) {
          return { episodeData: episode.episodeData, isWatched: true };
        } else {
          return episode;
        }
      });
      setPerviousWatched(newEpisodes);
      toast.success("Episode marked as watched");
      router.refresh();
    } else {
      toast.error("Failed to mark episode as watched");
    }
    setLoading(false);
  };

  return (
    <div>
      {isWatched ? (
        <Button
          className={cn(
            "text-white p-2 hover:bg-[#6c3384] duration-200 rounded-none m-0 h-full bg-[#6c3384]"
          )}
          onClick={handleUnmarkWatched}
          disabled={loading}
        >
          {loading ? (
            <Loader className="animate-spin" />
          ) : (
            <Check strokeWidth={4} />
          )}
        </Button>
      ) : (
        <Button
          className={cn(
            "text-white p-2 hover:bg-[#6c3384] duration-200 rounded-none m-0 h-full bg-transparent"
          )}
          disabled={loading}
          onClick={handleMarkWatchedSingle}
        >
          {loading ? (
            <Loader className="animate-spin" />
          ) : (
            <Check strokeWidth={4} />
          )}
        </Button>
      )}
    </div>
  );
};

export default MarkEpisodeWatchedBtn;
