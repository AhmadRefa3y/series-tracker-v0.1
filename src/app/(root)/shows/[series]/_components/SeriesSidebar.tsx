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
  };
}

const SeriesSidebar = ({ seriesDetails }: SeriesSidebarProps) => {
  return (
    <div className=" md:w-[200px] h-fit hidden md:block  sticky  top-60 CardDiv">
      <div className="absolute -top-40   inset-0 hidden md:block  ">
        <div className="flex flex-col  shadow-lg shadow-black">
          <div className="relative aspect-[2/3]  border-4 border-white w-full ">
            <div className="absolute inset-0 bg-black animate-fadeOut" />
            <Image
              src={`https://image.tmdb.org/t/p/w780/${seriesDetails.poster_path}`}
              alt={seriesDetails.name}
              fill
              quality={100}
              sizes="(max-width: 1000px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-right-top object-cover opacity-0 animate-fadeIn"
            />
          </div>
          <div className="flex p-3 items-center justify-center bg-[#2b2b2b]  flex-wrap gap-2">
            {seriesDetails.networks.map((network) => (
              <Image
                key={network.id}
                src={`https://image.tmdb.org/t/p/w300/${network.logo_path}`}
                alt={network.name}
                width={50}
                height={50}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

export default SeriesSidebar;
