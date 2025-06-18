// seasons.tsx
import { Season } from "@/types/seriesT";
import { getEpisodeDataWithWatchStatus } from "../seriesData";
import EpisodesClient from "@/app/(root)/shows/[series]/_components/EpisodesGrid";

interface EpisodesProps {
  seasonData: Season;
  seriesId: number;
  seriesImage: string;
}

const Episodes = async ({
  seasonData,
  seriesId,
  seriesImage,
}: EpisodesProps) => {
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
    <div className="flex flex-col text-black gap-3 items-start ">
      <EpisodesClient
        episodes={episodes}
        seriesId={seriesId}
        seriesImage={seriesImage}
      />
    </div>
  );
};

export default Episodes;
