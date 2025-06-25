import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SeriesData from "../../watchlist/_components/SeriesData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import { getUserUpNextSeries } from "@/app/(root)/(private)/dashboard/DashbaordData";
import Link from "next/link";

export default async function Watchlist() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const { success, data, error, message } = await getUserUpNextSeries();

  if (error || !success) {
    return (
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">{message}</h1>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex  items-center justify-center w-full my-10  text-white ">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="w-16 h-16 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
          <p className="text-lg text-gray-300 text-center max-w-md">
            Looks like you haven&apos;t added any series to your watchlist yet.
            Start exploring and add your favorite shows to keep track of
            what&apos;s up next!
          </p>
          <Link
            href="/shows"
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition"
          >
            Browse Series
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-white">
      <div className="flex justify-between items-center">
        <SectionHeader title="Up next" loading={false} />
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 w-full gap-y-2 py-4">
        {data.map(({ series, seriesData, episodes }) => (
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
            nextEpisodes={episodes.newEpisodes}
          />
        ))}
      </div>
    </div>
  );
}
