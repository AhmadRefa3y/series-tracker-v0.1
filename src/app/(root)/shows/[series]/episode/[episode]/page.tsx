import { ArrowLeft, Clock, Calendar, Heart, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { IMAGE_BASE_URL } from "@/lib/constants";
import MarkEpisodeWatchedBtn from "../../_components/MarkEpisodeWatchedBtn";
import { getSeriesDetails } from "../../seriesData";
import { Episode as EpisodeType } from "@/types/seriesT";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string; episode: string }>;
}) {
  const { episode } = await params;
  const [seriesId, seasonNum, episodeNum] = episode.split("-");
  const seriesDetails = await getSeriesDetails(seriesId);

  if (seriesDetails) {
    const episodeData = await fetchEpisodeDetails(
      seriesId,
      parseInt(seasonNum),
      parseInt(episodeNum)
    );
    if (episodeData) {
      return {
        title: `${seriesDetails.name} - S${seasonNum}E${episodeNum} - ${episodeData.name} - Seenit`,
      };
    }
  }
  return {
    title: "Episode Not Found - Seenit",
  };
}

async function fetchEpisodeDetails(
  seriesId: string,
  seasonNumber: number,
  episodeNumber: number
) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${process.env.TMDB_API_KEY}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ series: string; episode: string }>;
}) {
  const user = await auth();
  const { series, episode } = await params;
  const [seriesId, seasonNum, episodeNum] = episode.split("-");
  const seasonNumber = parseInt(seasonNum);
  const episodeNumber = parseInt(episodeNum);

  const seriesDetails = await getSeriesDetails(seriesId);
  if (!seriesDetails) {
    notFound();
  }

  const episodeData = await fetchEpisodeDetails(
    seriesId,
    seasonNumber,
    episodeNumber
  );

  if (!episodeData) {
    notFound();
  }

  const seriesDB = user?.user
    ? await prismaDb.series.findFirst({
        where: {
          seriesTmdbId: seriesId,
          userId: user?.user.id,
        },
        include: {
          watchedEpisodes: true,
        },
      })
    : null;

  const isWatched = seriesDB?.watchedEpisodes.some(
    (ep) =>
      ep.episodeNumber === episodeNumber && ep.seasonNumber === seasonNumber
  ) ?? false;

  // Fetch next and previous episodes
  const prevEpisode =
    episodeNumber > 1
      ? await fetchEpisodeDetails(seriesId, seasonNumber, episodeNumber - 1)
      : null;

  const nextEpisode =
    episodeNumber < (seriesDetails.number_of_episodes || 0)
      ? await fetchEpisodeDetails(seriesId, seasonNumber, episodeNumber + 1)
      : null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white">
      {/* Backdrop with enhanced overlay */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={
            episodeData.still_path
              ? `${IMAGE_BASE_URL}${episodeData.still_path}`
              : seriesDetails.backdrop_path
              ? `${IMAGE_BASE_URL}${seriesDetails.backdrop_path}`
              : "/no-image-available.webp"
          }
          alt={episodeData.name}
          fill
          sizes="100vw"
          className="object-cover object-top scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 via-transparent to-[#0f0f0f]/80" />

        {/* Back Button */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50">
          <Link
            href={`/shows/${series}`}
            className="group flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full transition-all backdrop-blur-md border border-white/20 hover:border-white/40"
          >
            <ArrowLeft size={14} className="sm:size-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-xs sm:text-sm md:text-base">Back</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-24 sm:-mt-32 md:-mt-40 lg:-mt-48 relative z-10 pb-8">
        {/* Episode Card */}
        <div className="bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Episode Still */}
            <div className="relative w-full h-[180px] sm:h-[200px] md:h-[225px] lg:w-[400px] lg:h-auto flex-shrink-0">
              <Image
                src={
                  episodeData.still_path
                    ? `${IMAGE_BASE_URL}${episodeData.still_path}`
                    : seriesDetails.poster_path
                    ? `${IMAGE_BASE_URL}${seriesDetails.poster_path}`
                    : "/no-image-available.webp"
                }
                alt={episodeData.name}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f] via-transparent to-transparent lg:hidden" />
            </div>

            {/* Episode Info */}
            <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Title and Episode Number */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="bg-gradient-to-r from-[#ff5f06] to-[#ff7b06] text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                      S{seasonNumber} • E{episodeNumber}
                    </span>
                    {episodeData.runtime && (
                      <span className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm">
                        <Clock size={12} className="sm:size-4" />
                        {episodeData.runtime} min
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight">
                    {episodeData.name}
                  </h1>
                </div>

                {/* Rating and Date */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-5 md:gap-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full" />
                      <Heart
                        fill={isWatched ? "darkred" : "none"}
                        className={`${isWatched ? 'text-red-600' : 'text-gray-400'} transition-colors size-6 sm:size-7 md:size-8`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg sm:text-xl">
                        {((episodeData.vote_average / 10) * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {episodeData.vote_count?.toLocaleString()} votes
                      </span>
                    </div>
                  </div>

                  {episodeData.air_date && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                      <Calendar size={14} className="sm:size-4 md:size-5" />
                      <span className="truncate max-w-[180px] sm:max-w-none">
                        {new Date(episodeData.air_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Watch Button */}
                <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
                  {user?.user ? (
                    <div className="scale-90 sm:scale-100 origin-left">
                      <MarkEpisodeWatchedBtn
                        episodeData={episodeData as EpisodeType}
                        isWatched={isWatched}
                        seriesId={seriesId}
                      />
                    </div>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff5f06] to-[#ff7b06] hover:from-[#ff7b06] hover:to-[#ff9a06] text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-orange-500/25 text-sm sm:text-base"
                    >
                      <Play size={16} className="sm:size-5" fill="currentColor" />
                      Sign in to track
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mt-4 sm:mt-5 md:mt-6 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-xl border border-white/10 p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-1 h-6 sm:h-7 md:h-8 bg-gradient-to-b from-[#ff5f06] to-[#ff7b06] rounded-full" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Overview</h2>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
            {episodeData.overview || "No overview available."}
          </p>
        </div>

        {/* Guest Stars */}
        {episodeData.guest_stars && episodeData.guest_stars.length > 0 && (
          <div className="mt-4 sm:mt-5 md:mt-6 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-xl border border-white/10 p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className="w-1 h-6 sm:h-7 md:h-8 bg-gradient-to-b from-[#ff5f06] to-[#ff7b06] rounded-full" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Guest Stars</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {episodeData.guest_stars.slice(0, 6).map((star: { id: number; name: string; profile_path: string | null; character?: string }) => (
                <div key={star.id} className="group">
                  <div className="relative aspect-square mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                    <Image
                      src={
                        star.profile_path
                          ? `${IMAGE_BASE_URL}${star.profile_path}`
                          : "/no-image-available.webp"
                      }
                      alt={star.name}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 96px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-semibold text-xs sm:text-sm truncate">{star.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {star.character || "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-4 sm:mt-5 md:mt-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {prevEpisode ? (
              <Link
                href={`/shows/${series}/episode/${seriesId}-${seasonNum}-${episodeNumber - 1}`}
                className="group flex-1 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] hover:from-[#252525] hover:to-[#202020] border border-white/10 hover:border-white/20 p-3 sm:p-4 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ff5f06]/20 transition-colors flex-shrink-0">
                    <ArrowLeft size={14} className="sm:size-5 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Previous</p>
                    <p className="font-semibold truncate text-sm sm:text-base group-hover:text-[#ff5f06] transition-colors">
                      E{episodeNumber - 1}: {prevEpisode.name}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextEpisode ? (
              <Link
                href={`/shows/${series}/episode/${seriesId}-${seasonNum}-${episodeNumber + 1}`}
                className="group flex-1 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] hover:from-[#252525] hover:to-[#202020] border border-white/10 hover:border-white/20 p-3 sm:p-4 rounded-xl transition-all text-center sm:text-right"
              >
                <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-end">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Next</p>
                    <p className="font-semibold truncate text-sm sm:text-base group-hover:text-[#ff5f06] transition-colors">
                      E{episodeNumber + 1}: {nextEpisode.name}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ff5f06]/20 transition-colors flex-shrink-0">
                    <ArrowLeft size={14} className="sm:size-5 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
