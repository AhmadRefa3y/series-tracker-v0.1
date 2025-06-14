import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const bgImages = [
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABTiYSJpsepUiT-DUOeGas2LWa6YuqaE98ljuJbEdZ4jFVlwNAiBTWOo-6Pqq9aVUlz2BaOzyivghnV0heQfozT5ArA8MfslfxvnB.webp?r=dce",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABRUIoCuHxV_L1HN4OCPXh1kSpnT-d-9ItxItczvkFlYq3GrYfh1UgpIR5kqn8jar1VaOJnqMnqNoERwCZg8mwJWrbKjfI6BR_bIz.webp?r=e5c",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABVV9gbt3EJsyDMLSD-0Jk01mW5lvHJX1STWaCA0VYXvolLOLAtSc3ufX4YLlJUFrL3QIzieFK_1tQJGhJbPCKqElfp48VWpHAjyx.webp?r=513",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABSe5OPuvJJy0knF7y4lrTDrsjgWbcoXyZ3EQsdpuDj24Qd6NzwIFqwv7FBu7OjfPwHd5FXeTplEL9iLIhYQvLT4nrbKssV07SHcROjm6QjFBrYEiVcky35S8HA.jpg?r=443",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABbpx1LFdVw5teF05uhn4FULxtwj2CdJRJzYN9g5c3RXMlHYZ0gwiri3fOvvFrWlXATv0RRizhRhrreVzFmF7My2UBrQRDhAT6Sf5.webp?r=611",
  "https://trakt.tv/assets/home/bg/2024/9@2x-56cd807697561fa68eea53b7b22b36c31c8140a86595d6d40b735c8e0d820593.jpg.webp",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABdbL6ZZEzh-LdCpHAe2PUaZxWGfvYU60NCwsANI6cetf1Mba1UX_VHMgLKWW43j9nMjpIz8dR6_H-0N098JSeOrTxNyMPmBiIoUxvcoibrTngC5DyeB0pmI8mg.jpg?r=92f",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABW98FkdmfkvAZDN6JyxHekYIK_U_b8KJONyuH2QUnC37SsKxDXQImGBaGDD21RhbL-UMMc64JZqJgJsbB5mJx4wvNd7K7b77_5znmmbo7TMWpp1GF4vjP_63.webp?r=54a",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABZ_2jVFGcYWPbW8-ffPxk8BjLVruP0FUW1fGzC6nRXmHDvfD_rP5i9q70pl4HDCvy5NAk-jlwKs8WchMBlGCtzlckWfzl_h9XFtk.webp?r=b86",
];
const HomePage = async () => {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return (
    <div>
      <Component />
      <HeroSection />
    </div>
  );
};

export default HomePage;

function HeroSection() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-800 via-orange-900 to-amber-700">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

      {/* Animated floating particles */}
      {/* <div className="absolute inset-0">
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
      </div> */}

      {/* Mountain silhouettes */}
      {/* <div className="absolute bottom-0 w-full h-64">
        <svg viewBox="0 0 1200 400" className="w-full h-full">
          <path
            d="M0,400 L0,200 Q150,150 300,180 T600,160 T900,190 T1200,170 L1200,400 Z"
            fill="rgba(0,0,0,0.4)"
          />
          <path
            d="M0,400 L0,250 Q200,200 400,230 T800,210 T1200,240 L1200,400 Z"
            fill="rgba(0,0,0,0.6)"
          />
        </svg>
      </div> */}

      {/* Main silhouette figure */}

      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {/* Horse silhouette */}

          {/* Flying bird silhouettes */}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Logo */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span className="text-4xl font-bold text-white tracking-tight">
              trakt
            </span>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="block transform hover:scale-105 transition-transform duration-500">
            Discover.
          </span>
          <span
            className="block transform hover:scale-105 transition-transform duration-500"
            style={{ transitionDelay: "0.1s" }}
          >
            Track.
          </span>
          <span
            className="block transform hover:scale-105 transition-transform duration-500"
            style={{ transitionDelay: "0.2s" }}
          >
            Share.
          </span>
        </h1>

        {/* Description */}
        <div className="max-w-2xl mb-12 text-lg md:text-xl text-gray-200 leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-white">Discover</span> what's
            hot and where to stream it.
            <span className="font-semibold text-white"> Track</span> shows and
            movies you watch.
          </p>
          <p>
            <span className="font-semibold text-white">Share</span> comments,
            recommendations, and ratings.
          </p>
        </div>

        {/* CTA Button */}
        <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
          <span className="flex items-center gap-2">
            JOIN TRAKT FOR FREE
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          {/* Button glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
        </button>

        {/* Subtle scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Additional atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none"></div>
    </div>
  );
}

function Component() {
  return (
    <div className="relative  w-full overflow-hidden">
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
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-3 shadow-lg">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
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
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            JOIN TRAKT FOR FREE
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
