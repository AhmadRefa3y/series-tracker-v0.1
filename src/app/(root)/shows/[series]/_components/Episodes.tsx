// seasons.tsx
import EpisodesGrid from "@/app/(root)/shows/[series]/_components/EpisodesGrid";
import prismaDb from "@/lib/prisma";
// import { fetchEpisodes } from "@/app/(root)/(private)/watchlist/WatchListData";
import { fetchAllEpisodes } from "@/data/globalData";
import { auth } from "@/auth";

interface EpisodesProps {
  seriesId: number;
  seriesImage: string;
}

const Episodes = async ({ seriesId, seriesImage }: EpisodesProps) => {
  const user = await auth();
  const watchedEpisodes = user?.user?.id
    ? await prismaDb.watchedEpisode.findMany({
        where: {
          Series: {
            seriesTmdbId: seriesId.toString(),
          },
          userId: user?.user?.id,
        },
      })
    : [];

  const getEpisodes = await fetchAllEpisodes(seriesId.toString());
  const episodesWithWatchStatus = getEpisodes.map((episode) => ({
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
        episodes={episodesWithWatchStatus}
        seriesId={seriesId}
        seriesImage={seriesImage}
      />
    </div>
  );
};

export default Episodes;
