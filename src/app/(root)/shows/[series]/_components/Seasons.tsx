"use client";
import { setEpisodWatched, Test } from "@/lib/actions/seriesActions";
import { cn } from "@/lib/utils";
import { Episode, Series } from "@/types/seriesT";
import { getEpisodeDataWithWatchStatus } from "@/data/tmdb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IMAGE_BASE_URL } from "@/lib/constants";

const Seasons = ({ seriesDetails }: { seriesDetails: Series }) => {
  const [ActiveSeason, setActiveSeason] = useState({
    season_number: 1,
    episode_count:
      seriesDetails.seasons.find((season) => season.season_number === 1)
        ?.episode_count || 0,
  });

  return (
    <div className="flex flex-col text-black gap-3 items-start" id="seasons">
      <div className="flex gap-2 w-[100px] flex-wrap">
        {seriesDetails.seasons.map((season) => {
          if (season.season_number > 0 && season.episode_count > 0) {
            return (
              <button
                key={season.id + season.season_number}
                onClick={() => setActiveSeason(season)}
                className="p-2 rounded flex flex-col items-center gap-2 hover:bg-[#9f42c6] hover:text-white duration-200 cursor-pointer capitalize"
              >
                season {season.season_number}
              </button>
            );
          }
        })}
      </div>
      <div className="flex-1 flex gap-y-2  w-full  flex-wrap h-full">
        {[...Array(ActiveSeason.episode_count)].map((_, i) => (
          <EpisodeComponent
            key={i}
            episode={{
              episode_number: i + 1,
              season_number: ActiveSeason.season_number,
            }}
            seriesId={seriesDetails.id}
            imageUrl={seriesDetails.backdrop_path || ""}
          />
        ))}
      </div>
    </div>
  );
};

export default Seasons;

const EpisodeComponent = ({
  episode,
  seriesId,
  imageUrl,
}: {
  episode: {
    episode_number: number;
    season_number: number;
  };
  seriesId: number;
  imageUrl: string;
}) => {
  const [EpisodeData, setEpisodeData] = useState<Episode | null>(null);
  const [Loading, setLoading] = useState(true);
  const [EpisodeMarked, setEpisodeMarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    // setEpisodeMarked(false);

    const fetchEpisodeData = async () => {
      try {
        // This now uses the secure server action from tmdb.ts
        const { episodeData, isWatched } = await getEpisodeDataWithWatchStatus(
          seriesId,
          episode.season_number,
          episode.episode_number
        );

        if (episodeData) {
          setEpisodeData(episodeData);
          setEpisodeMarked(isWatched);
        }
      } catch (error) {
        console.error("Error fetching episode data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [episode, seriesId]);

  const MarkEpisodeasWatched = async () => {
    try {
      const episodeWatched = await setEpisodWatched({
        episodeData: {
          seriesID: seriesId.toString(),
          episodeNumber: episode.episode_number,
          seasonNumber: episode.season_number,
        },
      });

      if (episodeWatched.success) {
        console.log("Episode marked as watched:", episodeWatched);
        setEpisodeMarked(true); // Update local state immediately
      }
    } catch (error) {
      console.error("Error marking episode as watched:", error);
    }
  };

  if (!EpisodeData) {
    return null;
  }

  return (
    <div
      className={cn(
        "pr-2 w-full sm:w-1/2 lg:w-1/3  ",
        Loading && "animate-pulse",
        EpisodeMarked && "opacity-50 text-white"
      )}
    >
      <div
        className="relative w-full min-w-[180px] h-[180px] lg:h-[170px] overflow-hidden rounded-sm cursor-pointer"
        onClick={MarkEpisodeasWatched}
      >
        <Image
          src={`${IMAGE_BASE_URL}${
            EpisodeData.still_path ? EpisodeData.still_path : imageUrl
          }`}
          alt={EpisodeData.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t to-60% from-black/60 to-transparent text-white p-4 ">
          <div className="flex flex-col  justify-end items-start h-full">
            <div className="font-extrabold text-lg flex gap-2">
              <span className=" ">
                {EpisodeData.season_number}x{EpisodeData.episode_number}
              </span>
              <span>{EpisodeData.name}</span>
              <button
                onClick={async () => {
                  await Test();
                }}
              >
                test
              </button>
            </div>
            <div className=" text-sm">
              <span>
                {new Date(EpisodeData.air_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="mx-1">—</span>
              <span className="italic"> {EpisodeData.runtime}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
