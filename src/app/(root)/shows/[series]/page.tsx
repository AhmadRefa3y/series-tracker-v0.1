import { RefreshCcw } from "lucide-react";

import React, { Suspense } from "react";
import { getSeriesDetails } from "./seriesData";
import { IsSeriesTracked } from "@/data/sharedData";
import Episodes from "./_components/Episodes";
import SeriesHeader from "@/app/(root)/shows/[series]/_components/SeriesHeader";
import SeriesDetails from "@/app/(root)/shows/[series]/_components/SeriesDetails";
import SeriesSidebar from "@/app/(root)/shows/[series]/_components/SeriesSidebar";
import SeriesBackdrop from "@/app/(root)/shows/[series]/_components/SeriesBackdrop";
import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const { series } = await params;
  const parts = series.split("-");
  const seriesId = parts[parts.length - 1];
  const seriesDetails = await getSeriesDetails(seriesId);
  if (seriesDetails) {
    return {
      title: `${seriesDetails.name} - Seenit`,
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ series: string }>;
  searchParams: Promise<{
    season: string;
  }>;
}) {
  const user = await auth();
  const { series } = await params;
  const parts = series.split("-");
  const seriesId = parts[parts.length - 1];
  const seriesDetails = await getSeriesDetails(seriesId);
  if (!seriesDetails) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <p className="text-white text-lg">Series not found.</p>
      </div>
    );
  }
  console.log("Series Details:", seriesDetails.name);

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

  return (
    <div className="w-full flex flex-col flex-1  text-white">
      <SeriesBackdrop seriesDetails={seriesDetails} />
      <div className="flex gap-2  xl:mx-35 detailsDiv bg-[#ffffff]   relative">
        <SeriesHeader seriesDetails={seriesDetails} />
        <div className="flex gap-2 xl:mx-35 container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SeriesSidebar
            seriesDetails={{
              poster_path: seriesDetails.poster_path || "",
              name: seriesDetails.name,
              networks: seriesDetails.networks.map((network) => ({
                id: network.id,
                logo_path: network.logo_path || "",
                name: network.name,
              })),
              number_of_seasons: seriesDetails.number_of_seasons,
              status: seriesDetails.status,
              first_air_date: seriesDetails.first_air_date,
              original_language: seriesDetails.original_language,
              episode_run_time: seriesDetails.episode_run_time,
              next_episode_to_air: seriesDetails.next_episode_to_air,
              number_of_episodes: seriesDetails.number_of_episodes,
              watchedEpisodesCount: seriesDB?.watchedEpisodes.length || 0,
            }}
          />
          <div className="flex flex-col flex-1 gap-2 sm:pb-5">
            <SeriesDetails
              seriesDetails={{
                ...seriesDetails,
                isTracked: !!(await IsSeriesTracked({ seriesID: seriesId })),
                tagline: seriesDetails.tagline || undefined,
                poster_path: seriesDetails.poster_path || "",
                Finished:
                  seriesDetails.number_of_episodes ===
                  seriesDB?.watchedEpisodes.length,
                watchedEpisodes: seriesDB?.watchedEpisodes.length || 0,
              }}
            />

            <div className="sm:px-0">
              <Suspense
                fallback={
                  <div className="flex w-full  items-center justify-center h-screen">
                    <RefreshCcw
                      className="animate-spin text-black "
                      height={48}
                      width={48}
                    />
                  </div>
                }
              >
                <Episodes
                  seriesId={+seriesId}
                  seriesImage={
                    seriesDetails.backdrop_path
                      ? `https://image.tmdb.org/t/p/w780${seriesDetails.backdrop_path}`
                      : seriesDetails.poster_path
                      ? `https://image.tmdb.org/t/p/w780${seriesDetails.poster_path}`
                      : "/no-image-available.webp"
                  }
                  seriesSlug={series}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
