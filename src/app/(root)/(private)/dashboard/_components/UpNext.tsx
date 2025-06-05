import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SeriesData from "../../watchlist/_components/SeriesData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import { getUserUpNextSeries } from "@/app/(root)/(private)/dashboard/DashbaordData";

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
      <div className="flex h-screen items-center justify-center w-full absolute inset-0 bg-black/60 text-white">
        <h1 className="text-3xl font-bold">No Series in Your Watchlist</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-white">
      <div className="flex justify-between items-center">
        <SectionHeader title="Up next" loading={false} />
      </div>
      <div className="flex flex-wrap items-center justify-center mt-3 w-full gap-y-2 py-4">
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
            nextEpisodes={episodes}
          />
        ))}
      </div>
    </div>
  );
}
