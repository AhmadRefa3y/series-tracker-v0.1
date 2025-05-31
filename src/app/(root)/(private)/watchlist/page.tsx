// app/watchlist/page.tsx
import { getMySeriesWatchlist } from "@/lib/actions/seriesActions";
import { redirect } from "next/navigation";
import { WatchListSeries } from "@/types";
import { Series } from "@/types/seriesT";
import { auth } from "@/auth";
import SeriesData from "./SeriesData";

const TMDB_API_KEY = "bb9cbfca59ec1d1fefd277beb3aa3d82";

async function fetchSeriesData(seriesId: string): Promise<Series | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}`,
      { cache: "force-cache" } // Cache for static data
    );
    if (!response.ok) throw new Error("Failed to fetch series data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching series data:", error);
    return null;
  }
}

async function fetchEpisodes(
  seriesId: string,
  numberOfSeasons: number,
  lastWatchedEpisode: { episodeNumber: number; seasonNumber: number } | null
): Promise<
  {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
    vote_average: number;
    runtime: number;
  }[]
> {
  try {
    const seasonPromises = Array.from({ length: numberOfSeasons }, (_, index) =>
      fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${
          index + 1
        }?api_key=${TMDB_API_KEY}`,
        { cache: "force-cache" }
      ).then((res) => res.json())
    );

    const seasons = await Promise.all(seasonPromises);
    const newEpisodes: {
      id: number;
      episode_number: number;
      season_number: number;
      name: string;
      overview: string;
      vote_average: number;
      runtime: number;
    }[] = [];

    for (const season of seasons) {
      newEpisodes.push(...(season.episodes || []));
    }

    return newEpisodes.filter((episode) => {
      if (!lastWatchedEpisode) return true;
      return (
        episode.season_number > lastWatchedEpisode.seasonNumber ||
        (episode.season_number === lastWatchedEpisode.seasonNumber &&
          episode.episode_number > lastWatchedEpisode.episodeNumber)
      );
    });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

export default async function Watchlist() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  let watchList: WatchListSeries[] = [];
  let error: string | null = null;

  try {
    const seriesWatchlist = await getMySeriesWatchlist();
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

  if (!watchList || watchList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
      </div>
    );
  }

  // Pre-fetch series data and episodes for each series in the watchlist
  const seriesDataPromises = watchList.map(async (series) => {
    const seriesData = await fetchSeriesData(series.seriesID.toString());
    const episodes = seriesData
      ? await fetchEpisodes(
          series.seriesID.toString(),
          seriesData.number_of_seasons,
          series.watchedEpisodes[0] || null
        )
      : [];
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
          nextEpisodes={episodes}
        />
      ))}
    </div>
  );
}
