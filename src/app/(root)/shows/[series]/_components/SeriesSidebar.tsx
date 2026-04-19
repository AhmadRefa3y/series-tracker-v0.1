import Image from "next/image";
import Link from "next/link";

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
    status: string;
    first_air_date: string;
    original_language: string;
    episode_run_time: number[];
    next_episode_to_air?: {
      air_date: string;
      episode_number: number;
      season_number: number;
      name: string;
    } | null;
    number_of_episodes: number;
    watchedEpisodesCount?: number;
  };
}

const SeriesSidebar = ({ seriesDetails }: SeriesSidebarProps) => {
  const progress = seriesDetails.watchedEpisodesCount 
    ? (seriesDetails.watchedEpisodesCount / seriesDetails.number_of_episodes) * 100 
    : 0;

  return (
    <div className=" md:w-[220px] h-fit hidden md:block  sticky  top-60 CardDiv z-40">
      <div className="absolute -top-40   inset-0 hidden md:block  ">
        <div className="flex flex-col  shadow-lg shadow-black/50 overflow-hidden rounded-sm">
          <div className="relative aspect-[2/3]  border-4 border-white w-full ">
            <div className="absolute inset-0 bg-black animate-fadeOut" />
            <Image
              src={
                seriesDetails.poster_path
                  ? `https://image.tmdb.org/t/p/w780${seriesDetails.poster_path}`
                  : "/no-image-available.webp"
              }
              alt={seriesDetails.name}
              fill
              quality={100}
              sizes="(max-width: 1000px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className=" object-cover opacity-0 animate-fadeIn"
            />
          </div>
          <div className="flex p-3 items-center justify-center bg-[#2b2b2b]  flex-wrap gap-4">
            {seriesDetails.networks.map((network) => (
              <div key={network.id} className="relative h-6 w-12">
                <Image
                  src={`https://image.tmdb.org/t/p/w300/${network.logo_path}`}
                  alt={network.name}
                  fill
                  className="object-contain filter brightness-0 invert opacity-0 animate-fadeIn"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Series Progress */}
        {seriesDetails.watchedEpisodesCount !== undefined && (
          <div className="mt-4 px-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-black mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {seriesDetails.watchedEpisodesCount} / {seriesDetails.number_of_episodes} Episodes
            </p>
          </div>
        )}

        {/* Series Info Section */}
        <div className="mt-6 flex flex-col gap-4 px-1">
          {seriesDetails.next_episode_to_air && (
            <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
              <h3 className="text-primary font-bold text-[10px] uppercase mb-1">Next Episode</h3>
              <p className="text-black font-bold text-xs">
                S{seriesDetails.next_episode_to_air.season_number} E{seriesDetails.next_episode_to_air.episode_number}
              </p>
              <p className="text-gray-600 text-[11px] truncate">{seriesDetails.next_episode_to_air.name}</p>
              <p className="text-gray-500 text-[10px] mt-1">
                {new Date(seriesDetails.next_episode_to_air.air_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
          
          <div>
            <h3 className="text-black font-bold text-[10px] uppercase mb-1 tracking-wider">Status</h3>
            <p className="text-gray-600 text-sm">{seriesDetails.status}</p>
          </div>
          <div>
            <h3 className="text-black font-bold text-[10px] uppercase mb-1 tracking-wider">First Air Date</h3>
            <p className="text-gray-600 text-sm">
              {new Date(seriesDetails.first_air_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <h3 className="text-black font-bold text-[10px] uppercase mb-1 tracking-wider">Language</h3>
              <p className="text-gray-600 text-sm uppercase">{seriesDetails.original_language}</p>
            </div>
            {seriesDetails.episode_run_time && seriesDetails.episode_run_time.length > 0 && (
              <div>
                <h3 className="text-black font-bold text-[10px] uppercase mb-1 tracking-wider">Runtime</h3>
                <p className="text-gray-600 text-sm">{seriesDetails.episode_run_time[0]}m</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start text-gray-400 mt-6 uppercase text-[10px] font-bold tracking-widest">
          <Link
            href={`#overview`}
            className="text-black border-b py-2 w-full border-gray-100 hover:text-primary transition-colors"
          >
            overview
          </Link>
          <Link
            href={`#activity`}
            className="hover:text-black duration-150 border-b py-2 w-full border-gray-100"
          >
            activity
          </Link>
          <Link
            href={`#recent-episodes`}
            className="hover:text-black duration-150 border-b py-2 w-full border-gray-100"
          >
            recent episodes
          </Link>
          <Link
            href={`#actors`}
            className="hover:text-black duration-150 border-b py-2 w-full border-gray-100"
          >
            actors
          </Link>
          <Link
            href={`#seasons`}
            className="hover:text-black duration-150 border-b py-2 w-full border-gray-100"
          >
            {seriesDetails.number_of_seasons} seasons
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SeriesSidebar;
