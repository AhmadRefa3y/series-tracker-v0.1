import { Heart, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import SeriesActionsBtns from "./_components/SeriesActionsBtns";
import Seasons from "./_components/Seasons";
import { IMAGE_BASE_URL } from "@/lib/constants";
import { IsSeriesTracked } from "@/lib/actions/seriesActions";
import { getSeriesDetails } from "./data";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ series: string }>;
  searchParams: Promise<{
    season: string;
  }>;
}) {
  const { series } = await params;
  const { season } = await searchParams;
  const seriesId = series.split("-")[1];
  const seriesDetails = await getSeriesDetails(seriesId);

  return (
    <div className="w-full flex flex-col  flex-1 contentDIv container mx-auto">
      <div className="w-full relative h-[500px]">
        <div className="absolute inset-0 bg-black animate-fadeOut" />
        <Image
          src={`https://image.tmdb.org/t/p/original/${
            seriesDetails.backdrop_path
              ? seriesDetails.backdrop_path
              : seriesDetails.poster_path
          }`}
          alt={seriesDetails.name}
          fill
          className={`opacity-0 animate-fadeIn ${
            seriesDetails.backdrop_path
              ? "object-cover object-top"
              : "object-contain object-center"
          }`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t to-60% from-black/60 to-transparent"></div>
        <SeriesDetils seriesDetails={seriesDetails} />
      </div>
      <div className="flex gap-2  xl:mx-35 mx-4 detailsDiv bg-[#ffffff]">
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
          }}
        />
        <div className="flex flex-col flex-1 gap-2 pb-5">
          <SeriesAdditionalDetails
            seriesDetails={{
              ...seriesDetails,
              isTracked: !!(await IsSeriesTracked({ seriesID: seriesId })),
              tagline: seriesDetails.tagline || undefined,
              poster_path: seriesDetails.poster_path || "",
            }}
          />
          <Suspense
            key={season}
            fallback={<RefreshCcw className="animate-spin" />}
          >
            <Seasons seriesDetails={seriesDetails} season={+season} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface SeriesDetails {
  name: string;
  first_air_date: string;
  vote_average: number;
  popularity: number;
}

const SeriesDetils = ({ seriesDetails }: { seriesDetails: SeriesDetails }) => {
  return (
    <div className="absolute inset-x-0 bottom-0  xl:mx-35 mx-4 flex">
      <div className="md:w-[200px] "></div>
      <div className="flex flex-col items-start  flex-1 ml-2">
        <div className="flex items-center   mb-3">
          <span className="text-3xl font-bold">{seriesDetails.name || ""}</span>
          <span className="ml-1 text-xl font-light text-gray-200 pt-2">
            {seriesDetails.first_air_date.split("-")[0]}
          </span>
          <span className="border border-white px-1  ml-1 font-semibold text-xs  mt-2 ">
            TV-MA
          </span>
        </div>
        <div className="  flex items-center bg-black/40 w-full  py-2">
          <div className="flex gap-2">
            <span className="flex items-center justify-center text-red-900">
              <Heart fill="darkred" size={35} />
            </span>
            <div className="flex flex-col ">
              <span className="font-semibold text-lg leading-5.5">
                {((seriesDetails.vote_average / 10) * 100).toFixed(0)}%
              </span>
              <span className="text-xs ">
                {seriesDetails.popularity.toFixed(1)}k Votes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeriesAdditionalDetails = ({
  seriesDetails,
}: {
  seriesDetails: {
    production_countries: Array<{ name: string }>;
    languages: string[];
    created_by: Array<{ name: string }>;
    production_companies: Array<{ name: string }>;
    genres: Array<{ name: string }>;
    tagline?: string;
    overview: string;
    id: number;
    number_of_episodes: number;
    poster_path: string;
    name: string;
    isTracked: boolean;
  };
}) => {
  return (
    <div className="flex flex-col lg:flex-row  justify-between p-4 flex-1 gap-2">
      <div className="flex flex-col lg:w-2/3 ">
        <div className="flex  gap-2 text-black flex-wrap h-fit">
          {seriesDetails.production_countries.length > 0 && (
            <span>
              <span className="text-[#949494] mr-1 font-bold"> Country :</span>
              {seriesDetails.production_countries.map(
                (Country, index) => `${index > 0 ? ", " : ""} ${Country.name}`
              )}
            </span>
          )}

          {seriesDetails.languages.length > 0 && (
            <span>
              <span className="text-[#949494] mr-1 font-bold">languages :</span>
              {seriesDetails.languages.map((lang) => lang)}
            </span>
          )}

          {seriesDetails.created_by.length > 0 && (
            <span>
              <span className="text-[#949494] mr-1 font-bold">creator :</span>
              {seriesDetails.created_by.map(
                (creator, index) => `${index > 0 ? ", " : ""} ${creator.name}`
              )}
            </span>
          )}

          {seriesDetails.production_companies.length > 0 && (
            <span>
              <span className="text-[#949494] mr-1 font-bold">Studios :</span>

              {`${seriesDetails.production_companies[0].name} ${
                seriesDetails.production_companies.length > 1 &&
                "and " +
                  (seriesDetails.production_companies.length - 1) +
                  " more"
              }  
                  `}
            </span>
          )}

          {seriesDetails.genres.length > 0 && (
            <span>
              <span className="text-[#949494] mr-1 font-bold"> Genres :</span>
              {seriesDetails.genres.map(
                (Genre, index) => `${index > 0 ? ", " : ""}${Genre.name}`
              )}
            </span>
          )}
        </div>
        {seriesDetails.tagline && (
          <div className="text-sm text-black italic mt-6">
            {seriesDetails.tagline}
          </div>
        )}
        <div className="text-sm text-black  mt-4">{seriesDetails.overview}</div>
      </div>
      <SeriesActionsBtns
        seriesData={{
          id: seriesDetails.id.toString(),
          number_of_episodes: seriesDetails.number_of_episodes,
          poster: `${IMAGE_BASE_URL}${seriesDetails.poster_path}`,
          title: seriesDetails.name,
          isTracked: seriesDetails.isTracked,
        }}
      />
    </div>
  );
};

interface SeriesSidebarProps {
  seriesDetails: {
    poster_path: string;
    name: string;
    networks: Array<{
      id: number;
      logo_path: string;
      name: string;
    }>;
    number_of_seasons: number;
  };
}

const SeriesSidebar = ({ seriesDetails }: SeriesSidebarProps) => {
  return (
    <div className=" md:w-[200px] h-fit hidden md:block  sticky  top-60 CardDiv">
      <div className="absolute -top-40   inset-0 hidden md:block  ">
        <div className="flex flex-col shadow-2xl">
          <div className="relative aspect-[2/3]  border-4 border-white w-full">
            <div className="absolute inset-0 bg-black animate-fadeOut" />
            <Image
              src={`https://image.tmdb.org/t/p/w780/${seriesDetails.poster_path}`}
              alt={seriesDetails.name}
              fill
              className="object-right-top object-cover opacity-0 animate-fadeIn"
            />
          </div>
          <div className="flex p-3 items-center justify-center bg-[#2b2b2b] rounded-b-sm flex-wrap gap-2">
            {seriesDetails.networks.map((network) => (
              <Image
                key={network.id}
                src={`https://image.tmdb.org/t/p/w300/${network.logo_path}`}
                alt={network.name}
                width={50}
                height={50}
                className="object-right-top object-cover opacity-0 animate-fadeIn"
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start text-gray-400 mt-3 uppercase text-sm">
          <Link
            href={`#overview`}
            className="text-black font-bold border-b py-1 w-full border-gray-300"
          >
            overview
          </Link>
          <Link
            href={`#activity`}
            className="hover:text-black duration-150 font-bold border-b py-[2px] w-full border-gray-300"
          >
            activity
          </Link>
          <Link
            href={`#recent-episodes`}
            className="hover:text-black duration-150 font-bold border-b py-[2px] w-full border-gray-300"
          >
            recent episodes
          </Link>
          <Link
            href={`#actors`}
            className="hover:text-black duration-150 font-bold border-b py-[2px] w-full border-gray-300"
          >
            actors
          </Link>
          <Link
            href={`#seasons`}
            className="hover:text-black duration-150 font-bold border-b py-[2px] w-full border-gray-300"
          >
            {seriesDetails.number_of_seasons} seasons
          </Link>
        </div>
      </div>
    </div>
  );
};
