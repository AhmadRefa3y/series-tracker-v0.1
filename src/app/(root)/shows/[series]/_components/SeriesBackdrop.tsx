import Image from "next/image";
import React from "react";

const SeriesBackdrop = ({
  seriesDetails,
}: {
  seriesDetails: {
    backdrop_path: string | null;
    poster_path: string | null;
    name: string;
  };
}) => {
  return (
    <div className="w-full relative h-[310px] md:h-[500px] ">
      <div className="absolute inset-0 bg-black animate-fadeOut" />
      <Image
        unoptimized
        src={`https://image.tmdb.org/t/p/original/${
          seriesDetails.backdrop_path
            ? seriesDetails.backdrop_path
            : seriesDetails.poster_path
        }`}
        alt={seriesDetails.name}
        fill
        sizes="(max-width: 1800px) 100vw, (max-width: 1800px) 50vw, 33vw"
        className={`opacity-0 animate-fadeIn ${
          seriesDetails.backdrop_path
            ? "object-cover object-top"
            : "object-contain object-center"
        }`}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t to-60% from-black/60 to-transparent"></div>
    </div>
  );
};

export default SeriesBackdrop;
