import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const bgImages = [
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABTiYSJpsepUiT-DUOeGas2LWa6YuqaE98ljuJbEdZ4jFVlwNAiBTWOo-6Pqq9aVUlz2BaOzyivghnV0heQfozT5ArA8MfslfxvnB.webp?r=dce",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABRUIoCuHxV_L1HN4OCPXh1kSpnT-d-9ItxItczvkFlYq3GrYfh1UgpIR5kqn8jar1VaOJnqMnqNoERwCZg8mwJWrbKjfI6BR_bIz.webp?r=e5c",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABVV9gbt3EJsyDMLSD-0Jk01mW5lvHJX1STWaCA0VYXvolLOLAtSc3ufX4YLlJUFrL3QIzieFK_1tQJGhJbPCKqElfp48VWpHAjyx.webp?r=513",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABSe5OPuvJJy0knF7y4lrTDrsjgWbcoXyZ3EQsdpuDj24Qd6NzwIFqwv7FBu7OjfPwHd5FXeTplEL9iLIhYQvLT4nrbKssV07SHcROjm6QjFBrYEiVcky35S8HA.jpg?r=443",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABbpx1LFdVw5teF05uhn4FULxtwj2CdJRJzYN9g5c3RXMlHYZ0gwiri3fOvvFrWlXATv0RRizhRhrreVzFmF7My2UBrQRDhAT6Sf5.webp?r=611",
  "https://trakt.tv/assets/home/bg/2024/9@2x-56cd807697561fa68eea53b7b22b36c31c8140a86595d6d40b735c8e0d820593.jpg.webp",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABdbL6ZZEzh-LdCpHAe2PUaZxWGfvYU60NCwsANI6cetf1Mba1UX_VHMgLKWW43j9nMjpIz8dR6_H-0N098JSeOrTxNyMPmBiIoUxvcoibrTngC5DyeB0pmI8mg.jpg?r=92f",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABZ_2jVFGcYWPbW8-ffPxk8BjLVruP0FUW1fGzC6nRXmHDvfD_rP5i9q70pl4HDCvy5NAk-jlwKs8WchMBlGCtzlckWfzl_h9XFtk.webp?r=b86",
];
const HomePage = async () => {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return (
    <div className="relative flex flex-col items-center justify-center bg-black text-white  h-full ">
      <Hero />
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <Suspense fallback={<TopShowsSkeleton />}>
          <TopShows />
        </Suspense>
      </div>
    </div>
  );
};

export default HomePage;

function Hero() {
  return (
    <div className="relative w-full  flex flex-col  h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={bgImages[Math.floor(Math.random() * bgImages.length)]}
          alt="Dramatic landscape with silhouettes"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-300/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute top-20 right-16 animate-pulse">
        <svg width="40" height="20" viewBox="0 0 40 20">
          <path
            d="M5,10 Q15,5 25,10 Q30,8 35,12 Q30,15 25,12 Q15,18 5,12 Q10,8 5,10 Z"
            fill="black"
            opacity="0.8"
          />
        </svg>
      </div>
      <div
        className="absolute top-32 right-8 animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        <svg width="35" height="18" viewBox="0 0 35 18">
          <path
            d="M3,9 Q12,4 22,9 Q27,7 32,11 Q27,14 22,11 Q12,16 3,11 Q8,7 3,9 Z"
            fill="black"
            opacity="0.6"
          />
        </svg>
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div>
              <Image src="logo.svg" alt="logo" width={65} height={65} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              Seenit
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover. Track. Share.
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold">Discover</span> what&#39;s hot and
            where to stream it. <span className="font-semibold">Track</span>{" "}
            shows and movies you watch.{" "}
            <span className="font-semibold">Share</span> comments,
            recommendations, and ratings.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            JOIN Seenit FOR FREE
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

async function fetchTrendingShowsFromTMDB() {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate delay for demo purposes
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
}

async function TopShows() {
  const shows: Show[] = await fetchTrendingShowsFromTMDB();

  return (
    <section className="w-full max-w-7xl mx-auto mt-12 px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Top Shows</h2>
          <p className="text-white/80 mt-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {shows.map((show: Show) => (
          <a
            key={show.id}
            href={`https://www.themoviedb.org/tv/${show.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full rounded-2xl overflow-hidden bg-white/5 shadow-lg group flex flex-col"
          >
            <Image
              src={
                show.poster_path
                  ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                  : "/shows/placeholder.jpg"
              }
              alt={show.name}
              width={320}
              height={180}
              className="object-cover w-full h-60"
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-black/0">
              <span className="text-white font-semibold text-lg">
                {show.name}
              </span>
              <span className="text-white/70 font-medium ml-2">
                {show.first_air_date?.slice(0, 4)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

async function TopShowsSkeleton() {
  return (
    <section className="w-full max-w-7xl mx-auto mt-12 px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Top Shows</h2>
          <p className="text-white/80 mt-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="relative w-full rounded-2xl overflow-hidden bg-white/5 shadow-lg group flex flex-col animate-pulse"
          >
            <div className="w-full h-60 bg-gray-700/60" />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-black/0">
              <div className="h-6 w-3/4 bg-gray-600 rounded mb-2" />
              <div className="h-4 w-1/4 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
