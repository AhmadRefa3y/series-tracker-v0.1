import Image from "next/image";
import Link from "next/link";

async function fetchTrendingShowsFromTMDB() {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 4);
}

interface Show {
  id: number;
  name: string;
  poster_path?: string | null;
  first_air_date?: string;
  backdrop_path?: string | null;
}

export default async function TrendingShows() {
  const shows: Show[] = await fetchTrendingShowsFromTMDB();

  return (
    <section className="w-full max-w-7xl mx-auto mt-8 sm:mt-12 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primaryColor">
            Trending Shows
          </h2>
          <p className=" mt-1 text-base sm:text-lg text-neutralColor">
            Here&apos;s what shows are trending now.
          </p>
        </div>
        <Link
          href="/shows"
          className="text-primaryColor/70 hover:text-primaryColor text-sm font-medium flex items-center gap-1 transition"
        >
          SEE MORE <span className="ml-1">&rarr;</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {shows.map((show: Show) => (
          <Link
            key={show.id}
            href={`shows/${show.name.replace(/\s+/g, "_").toLowerCase()}-${
              show.id
            }`}
            className="relative w-full max-w-[335px] aspect-[335/190] rounded-2xl overflow-hidden bg-white/5 shadow-lg    mx-auto"
            style={{ minWidth: 0 }}
          >
            <Image
              src={
                show.backdrop_path
                  ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}`
                  : "/shows/placeholder.jpg"
              }
              alt={show.name}
              fill
              className="object-cover w-full h-full"
              priority={false}
            />
            <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-t from-black/80 to-black/0">
              <span className="text-white font-semibold text-base sm:text-lg">
                {show.name}
              </span>
              <span className="text-white/70 font-medium ml-2">
                {show.first_air_date?.slice(0, 4)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function TopShowsSkeleton() {
  return (
    <section className="w-full max-w-7xl mx-auto mt-8 sm:mt-12 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Top Shows
          </h2>
          <p className="text-white/80 mt-1 text-base sm:text-lg">
            Here&apos;s what shows are trending now.
          </p>
        </div>
        <Link
          href="https://www.themoviedb.org/tv"
          className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition"
          target="_blank"
        >
          SEE MORE <span className="ml-1">&rarr;</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="relative w-full rounded-2xl overflow-hidden bg-white/5 shadow-lg group flex flex-col animate-pulse min-h-[260px] sm:min-h-[300px]"
          >
            <div className="w-full h-48 sm:h-60 bg-gray-700/60" />
            <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-t from-black/80 to-black/0">
              <div className="h-5 sm:h-6 w-2/3 sm:w-3/4 bg-gray-600 rounded mb-2" />
              <div className="h-3 sm:h-4 w-1/4 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
