// seasons.tsx
import { Season } from "@/types/seriesT";
import EpisodesGrid from "@/app/(root)/shows/[series]/_components/EpisodesGrid";
import prismaDb from "@/lib/prisma";

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
  const watchedEpisodes = await prismaDb.watchedEpisode.findMany({
    where: {
      seriesId: seriesId.toString(),
    },
  });
  const episodes = seasonData.episodes.map((episode) => ({
    episodeData: episode,
    isWatched: watchedEpisodes.some(
      (watched) =>
        watched.episodeNumber === episode.episode_number &&
        watched.seasonNumber === episode.season_number
    ),
  }));

  return (
    <div className="flex flex-col text-black gap-3 items-start ">
      <EpisodesGrid
        episodes={episodes}
        seriesId={seriesId}
        seriesImage={seriesImage}
      />
    </div>
  );
};

export default Episodes;
