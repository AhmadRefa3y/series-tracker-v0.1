// seasons.tsx
import { Season } from "@/types/seriesT";
import { getEpisodeDataWithWatchStatus } from "../seriesData";
import EpisodesClient from "@/app/(root)/shows/[series]/_components/EpisodesClient";

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

const Seasons = async ({ seasonData, seriesId }: SeasonsProps) => {
  // Fetch all episodes and their watch status on the server
  const episodes = await Promise.all(
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
    <div className="flex flex-col text-black gap-3 items-start h-screen">
      {/* <div className="flex items-center gap-2 w-full">
        <h2 className="text-2xl font-bold">
          Season {seasonData.season_number}
        </h2>
        <span className="text-sm text-gray-500">
          ({episodes.length} episodes)
        </span>
      </div> */}
      <EpisodesClient episodes={episodes} seriesId={seriesId} />
    </div>
  );
};

export default Seasons;
