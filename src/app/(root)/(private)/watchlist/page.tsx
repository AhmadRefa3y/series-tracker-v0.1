// app/watchlist/page.tsx
import { WatchListSeries } from "@/types";
import SeriesData from "./_components/SeriesData";
import { fetchEpisodes, fetchSeriesData } from "./WatchListData";
import { getCurrentUser } from "@/lib/actions/userActions";
import { getUserSeriesWatchlist } from "@/data/sharedData";

export const dynamic = "force-dynamic";
export default async function Watchlist() {
  await getCurrentUser("/watchlist");

  let watchList: WatchListSeries[] = [];
  let error: string | null = null;

  try {
    const seriesWatchlist = await getUserSeriesWatchlist();
    watchList = seriesWatchlist || [];
  } catch (err) {
    error = "Failed to load watchlist";
    console.error(err);
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">{error}</h1>
      </div>
    );
  }

  if (watchList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
      </div>
    );
  }

  // Pre-fetch series data and episodes for each series in the watchlist
  const seriesDataPromises = watchList.map(async (series) => {
    const seriesData = await fetchSeriesData(series.seriesID.toString());

    const episodes = await fetchEpisodes(
      series.seriesID.toString(),
      seriesData!.number_of_seasons,
      series.watchedEpisodes[0] || null
    );
    return { series, seriesData, episodes };
  });

  const seriesWithData = await Promise.all(seriesDataPromises);

  return (
    <div className="flex justify-center flex-wrap p-4 w-full gap-y-2 bg-[#1d1d1d]">
      {seriesWithData.map(({ series, seriesData, episodes }) => (
        <SeriesData
          key={series.seriesID}
          episodeNumber={series.currentEpisodeNumber}
          posterPath={series.seriesPoster}
          seasonNumber={series.episodeSeason}
          seriesId={series.seriesID.toString()}
          title={series.seriesTitle}
          InitWatchedEpisodes={series.watchedEpisodes.length}
          lastWatchedEpisode={series.watchedEpisodes[0]}
          seriesData={seriesData}
          nextEpisodes={episodes?.newEpsiodes || []}
        />
      ))}
    </div>
  );
}
