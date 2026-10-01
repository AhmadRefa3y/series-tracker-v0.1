import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Star, TrendingUp } from "lucide-react";

async function fetchTrendingShowsFromTMDB() {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 8);
}

interface Show {
  id: number;
  name: string;
  poster_path?: string | null;
  first_air_date?: string;
  backdrop_path?: string | null;
  vote_average?: number;
  number_of_seasons?: number;
}

const seriesHref = (show: Show) =>
  `/shows/${show.name.replace(/\s+/g, "_").toLowerCase()}-${show.id}`;

const TrendingCard = ({ show }: { show: Show }) => {
  const year = show.first_air_date?.slice(0, 4);

  return (
    <Link
      href={seriesHref(show)}
      className="group relative block aspect-[16/10] overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-700 shadow-lift transition-all duration-500 hover:-translate-y-1 hover:border-primaryColor/40 hover:shadow-gold"
    >
      <Image
        src={
          show.backdrop_path
            ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}`
            : show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : "/shows/placeholder.jpg"
        }
        alt={show.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />

      {show.vote_average ? (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
          <Star className="size-3 fill-primaryColor text-primaryColor" />
          {show.vote_average.toFixed(1)}
        </span>
      ) : null}

      <span className="absolute right-3 top-3 flex size-9 translate-y-1 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Play className="size-4 translate-x-px fill-current" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="truncate text-base font-semibold tracking-tight text-white">
          {show.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-white/55">
          {year ? <span>{year}</span> : null}
          {year && show.number_of_seasons ? (
            <span aria-hidden className="size-1 rounded-full bg-white/30" />
          ) : null}
          {show.number_of_seasons ? (
            <span>
              {show.number_of_seasons} season
              {show.number_of_seasons > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default async function TrendingShows() {
  const shows: Show[] = await fetchTrendingShowsFromTMDB();

  return (
    <section className="w-full">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] text-primaryColor shadow-inset">
            <TrendingUp className="size-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primaryColor/80">
              This week
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Trending Shows
            </h2>
            <p className="mt-1 text-sm text-white/50">
              What the world is watching right now.
            </p>
          </div>
        </div>

        <Link
          href="/shows"
          className="group/see inline-flex w-fit items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[13px] font-semibold text-white/60 transition-all duration-300 hover:border-primaryColor/40 hover:bg-primaryColor/10 hover:text-primaryColor"
        >
          See more
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/see:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shows.map((show) => (
          <TrendingCard key={show.id} show={show} />
        ))}
      </div>
    </section>
  );
}

export function TopShowsSkeleton() {
  return (
    <section className="w-full">
      <div className="flex items-center gap-3">
        <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
          <div className="h-6 w-48 animate-pulse rounded bg-white/[0.07]" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, idx) => (
          <div
            key={idx}
            className="relative aspect-[16/10] animate-pulse overflow-hidden rounded-3xl border border-white/[0.05] bg-ink-700"
          >
            <div className="absolute inset-0 bg-white/[0.04]" />
            <div className="absolute inset-x-4 bottom-4 space-y-2">
              <div className="h-4 w-2/3 rounded bg-white/[0.08]" />
              <div className="h-3 w-1/3 rounded bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
