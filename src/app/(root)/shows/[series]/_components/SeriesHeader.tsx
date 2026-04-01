import { Heart } from "lucide-react";

interface SeriesDetails {
  name: string;
  first_air_date: string;
  vote_average: number;
  popularity: number;
}

const SeriesHeader = ({ seriesDetails }: { seriesDetails: SeriesDetails }) => {
  return (
    <div className="absolute inset-x-0 bottom-[100%]   flex">
      <div className="flex flex-col items-start  flex-1 ">
        <div className=" container  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center  mb-3 md:ml-[215px] px-2 sm:px-0">
            <span className="text-3xl font-bold">
              {seriesDetails.name || ""}
            </span>
            <span className="ml-1 text-xl font-light text-gray-200 pt-2">
              {seriesDetails.first_air_date.split("-")[0]}
            </span>
            <span className="border border-white px-1  ml-1 font-semibold text-xs  mt-2 ">
              TV-MA
            </span>
          </div>
        </div>
        <div className="  flex items-center bg-black/40 w-full  py-2">
          <div className="container  mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="flex gap-2 md:ml-[215px] px-2 sm:px-0">
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
    </div>
  );
};

export default SeriesHeader;
