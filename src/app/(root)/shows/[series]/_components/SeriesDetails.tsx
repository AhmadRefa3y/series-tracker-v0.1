import SeriesActionsBtns from "@/app/(root)/shows/[series]/_components/SeriesActionsBtns";
import { IMAGE_BASE_URL } from "@/lib/constants";

const SeriesDetails = ({
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
    <div className="flex flex-col lg:flex-row  justify-between p-4 flex-1 gap-2 font-bold">
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

export default SeriesDetails;
