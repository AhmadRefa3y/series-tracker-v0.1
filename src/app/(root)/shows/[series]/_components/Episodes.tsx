// seasons.tsx
import PaginatedEpisodesGrid from "@/app/(root)/shows/[series]/_components/PaginatedEpisodesGrid";
import prismaDb from "@/lib/prisma";
// import { fetchEpisodes } from "@/app/(root)/(private)/watchlist/WatchListData";
import { fetchAllEpisodes } from "@/data/globalData";
import { auth } from "@/auth";

interface EpisodesProps {
  seriesId: number;
  seriesImage: string;
  seriesSlug: string;
}

const Episodes = async ({ seriesId, seriesImage, seriesSlug }: EpisodesProps) => {
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
  if (!getEpisodes) {
    return (
      <div className="flex items-center justify-center text-black">
        No episodes found.
      </div>
    );
  }
  const episodesWithWatchStatus = getEpisodes.map((episode) => ({
    episodeData: episode,
    isWatched: watchedEpisodes.some(
      (watched) =>
        watched.episodeNumber === episode.episode_number &&
        watched.seasonNumber === episode.season_number
    ),
  }));

  return (
    <div className="flex flex-col text-black gap-3 items-start">
      <PaginatedEpisodesGrid
        episodes={episodesWithWatchStatus}
        seriesId={seriesId}
        seriesImage={seriesImage}
        seriesSlug={seriesSlug}
      />
    </div>
  );
};

export default Episodes;
