// seasons.tsx
import { cn } from "@/lib/utils";
import { Episode, Season } from "@/types/seriesT";
import Image from "next/image";
import { IMAGE_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { getEpisodeDataWithWatchStatus } from "../seriesData";
import { setEpisodWatched } from "../../actions";

interface SeasonData {
  air_date: string | null; // e.g., "2011-04-17"
  episode_count: number;
  id: number;
  name: string; // e.g., "Season 1"
  overview: string;
  poster_path: string | null; // URL path to season poster
  season_number: number;
  vote_average: number; // Season-specific rating
}
interface SeasonsProps {
  season: number;
  seasonData: Season;
  seriesId: number;
  SeasonsData: SeasonData[];
  seriesName: string;
}

const Seasons = async ({
  // season = 1,
  seasonData,
  seriesId,
  SeasonsData,
  seriesName,
}: SeasonsProps) => {
  let episodes: { episodeData: Episode; isWatched: boolean }[] = [];

  episodes = await Promise.all(
    seasonData.episodes.map(async (episode) => {
      const { episodeData, isWatched } = await getEpisodeDataWithWatchStatus(
        seriesId,
        episode.season_number,
        episode.episode_number
      );
      return { episodeData, isWatched };
    })
  );

  return (
    <div className="flex flex-col text-black gap-3 items-start" id="seasons">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {SeasonsData.filter((season) => season.season_number !== 0).map(
          (season, i) => (
            <Link
              key={i}
              className="flex flex-col items-center gap-4   duration-200 cursor-pointer capitalize w-full group relative"
              href={`?season=${season.season_number}`}
              scroll={false}
            >
              <div className="absolute bottom-[102%] left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center">
                <div className="bg-black flex flex-col items-center rounded-lg">
                  <span className=" text-white text-sm font-semibold px-3 py-1 rounded shadow-lg whitespace-nowrap">
                    {seriesName}
                  </span>
                  <span className=" text-white text-sm font-semibold px-3 py-1 rounded shadow-lg whitespace-nowrap">
                    Season {season.season_number}
                  </span>
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black mx-auto"></div>
              </div>
              <div className="relative w-full aspect-[2/3] max-w-[200px] bg-gray-200 overflow-hidden">
                {season.poster_path ? (
                  <Image
                    src={`${IMAGE_BASE_URL}${season.poster_path}`}
                    alt={season.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-lg text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="text-center w-full">
                <div className="font-semibold text-base truncate">
                  season {season.season_number}
                </div>
                <div className="text-[15px] text-gray-500">
                  {season.episode_count} episodes
                </div>
              </div>
            </Link>
          )
        )}
      </div>

      <div className="flex-1 flex gap-y-2 w-full flex-wrap h-full">
        {episodes.map(({ episodeData, isWatched }, i) => (
          <EpisodeComponent
            key={i}
            episode={{
              episode_number: episodeData.episode_number,
              season_number: episodeData.season_number,
            }}
            seriesId={seriesId}
            imageUrl={episodeData.still_path || ""}
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
