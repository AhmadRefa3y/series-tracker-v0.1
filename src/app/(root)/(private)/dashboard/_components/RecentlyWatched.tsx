import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { getRecentlyWatchedEpisodes } from "../DashbaordData";

const RecentlyWatched = async () => {
  const recentEpisodes = await getRecentlyWatchedEpisodes(6);

  if (!recentEpisodes?.success || !recentEpisodes.data?.length) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Recently Watched</h2>
        <Link
          href="/history"
          className="text-sm hover:text-[#9f42c6] transition-colors"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentEpisodes.data.map((episode) => (
          <Link
            href={`/series/${episode.Series.seriesTmdbId}`}
            key={episode.id}
            className="relative bg-gray-800 rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200"
          >
            <div className="absolute top-2 left-2 bg-[#9f42c6] text-white text-sm px-2 py-1 rounded z-10">
              {format(new Date(episode.watchedAt), "MMM dd, yyyy h:mm a")}
            </div>
            <div className="relative aspect-video">
              <Image
                src={episode.stillPath || episode.Series.posterPath || ""}
                alt={`${episode.Series.title} S${episode.seasonNumber}E${episode.episodeNumber}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                <div className="text-white">
                  <h3 className="font-semibold text-lg">
                    {episode.Series.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm opacity-80">
                      {`${episode.seasonNumber}x${String(
                        episode.episodeNumber
                      ).padStart(2, "0")} ${episode.name || ""}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyWatched;
