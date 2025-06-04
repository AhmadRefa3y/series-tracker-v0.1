// seasons.tsx
import { cn } from "@/lib/utils";
import { Episode, Series } from "@/types/seriesT";
import Image from "next/image";
import { IMAGE_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { getEpisodeDataWithWatchStatus } from "../data";
import { setEpisodWatched } from "../../actions";

interface SeasonsProps {
  seriesDetails: Series;
  season: number;
}

const Seasons = async ({ seriesDetails, season }: SeasonsProps) => {
  // Default to the first season with episodes
  const defaultSeason =
    seriesDetails.seasons.find(
      (seasonData) => seasonData.season_number === season
    ) || seriesDetails.seasons[0];

  // Fetch episode data for the default season
  const episodes = await Promise.all(
    Array.from({ length: defaultSeason.episode_count }, async (_, i) => {
      const { episodeData, isWatched } = await getEpisodeDataWithWatchStatus(
        seriesDetails.id,
        defaultSeason.season_number,
        i + 1
      );
      return { episodeData, isWatched };
    })
  );

  return (
    <div className="flex flex-col text-black gap-3 items-start" id="seasons">
      <div className="flex gap-2 w-[100px] flex-wrap">
        {seriesDetails.seasons.map((season) => {
          if (season.season_number > 0 && season.episode_count > 0) {
            return (
              <Link
                key={season.id + season.season_number}
                className="p-2 rounded flex flex-col items-center gap-2 hover:bg-[#9f42c6] hover:text-white duration-200 cursor-pointer capitalize"
                href={`?season=${season.season_number}`}
                scroll={false}
              >
                season {season.season_number}
              </Link>
            );
          }
          return null;
        })}
      </div>
      <div className="flex-1 flex gap-y-2 w-full flex-wrap h-full">
        {episodes.map(({ episodeData, isWatched }, i) => (
          <EpisodeComponent
            key={i}
            episode={{
              episode_number: i + 1,
              season_number: defaultSeason.season_number,
            }}
            seriesId={seriesDetails.id}
            imageUrl={seriesDetails.backdrop_path || ""}
            episodeData={episodeData}
            isWatched={isWatched}
          />
        ))}
      </div>
    </div>
  );
};

interface EpisodeComponentProps {
  episode: {
    episode_number: number;
    season_number: number;
  };
  seriesId: number;
  imageUrl: string;
  episodeData: Episode | null;
  isWatched: boolean;
}

const EpisodeComponent = ({
  episode,
  seriesId,
  imageUrl,
  episodeData,
  isWatched,
}: EpisodeComponentProps) => {
  if (!episodeData) {
    return null;
  }

  // Form action for marking episode as watched
  async function markEpisodeAsWatched() {
    "use server";
    await setEpisodWatched({
      episodeData: {
        seriesID: seriesId.toString(),
        episodeNumber: episode.episode_number,
        seasonNumber: episode.season_number,
      },
    });
  }

  return (
    <form action={markEpisodeAsWatched}>
      <button
        type="submit"
        className={cn(
          "pr-2 w-full sm:w-1/2 lg:w-1/3",
          isWatched && "opacity-50 text-white"
        )}
      >
        <div className="relative w-full min-w-[180px] h-[180px] lg:h-[170px] overflow-hidden rounded-sm cursor-pointer">
          <Image
            src={`${IMAGE_BASE_URL}${
              episodeData.still_path ? episodeData.still_path : imageUrl
            }`}
            alt={episodeData.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t to-60% from-black/60 to-transparent text-white p-4">
            <div className="flex flex-col justify-end items-start h-full">
              <div className="font-extrabold text-lg flex gap-2">
                <span>
                  {episodeData.season_number}x{episodeData.episode_number}
                </span>
                <span>{episodeData.name}</span>
              </div>
              <div className="text-sm">
                <span>
                  {new Date(episodeData.air_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="mx-1">—</span>
                <span className="italic">{episodeData.runtime}m</span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </form>
  );
};

export default Seasons;
