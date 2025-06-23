import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HeroBgImages = [
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABTiYSJpsepUiT-DUOeGas2LWa6YuqaE98ljuJbEdZ4jFVlwNAiBTWOo-6Pqq9aVUlz2BaOzyivghnV0heQfozT5ArA8MfslfxvnB.webp?r=dce",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABRUIoCuHxV_L1HN4OCPXh1kSpnT-d-9ItxItczvkFlYq3GrYfh1UgpIR5kqn8jar1VaOJnqMnqNoERwCZg8mwJWrbKjfI6BR_bIz.webp?r=e5c",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABVV9gbt3EJsyDMLSD-0Jk01mW5lvHJX1STWaCA0VYXvolLOLAtSc3ufX4YLlJUFrL3QIzieFK_1tQJGhJbPCKqElfp48VWpHAjyx.webp?r=513",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABSe5OPuvJJy0knF7y4lrTDrsjgWbcoXyZ3EQsdpuDj24Qd6NzwIFqwv7FBu7OjfPwHd5FXeTplEL9iLIhYQvLT4nrbKssV07SHcROjm6QjFBrYEiVcky35S8HA.jpg?r=443",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABbpx1LFdVw5teF05uhn4FULxtwj2CdJRJzYN9g5c3RXMlHYZ0gwiri3fOvvFrWlXATv0RRizhRhrreVzFmF7My2UBrQRDhAT6Sf5.webp?r=611",
  "https://trakt.tv/assets/home/bg/2024/9@2x-56cd807697561fa68eea53b7b22b36c31c8140a86595d6d40b735c8e0d820593.jpg.webp",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABdbL6ZZEzh-LdCpHAe2PUaZxWGfvYU60NCwsANI6cetf1Mba1UX_VHMgLKWW43j9nMjpIz8dR6_H-0N098JSeOrTxNyMPmBiIoUxvcoibrTngC5DyeB0pmI8mg.jpg?r=92f",
  "https://occ-0-6661-56.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABZ_2jVFGcYWPbW8-ffPxk8BjLVruP0FUW1fGzC6nRXmHDvfD_rP5i9q70pl4HDCvy5NAk-jlwKs8WchMBlGCtzlckWfzl_h9XFtk.webp?r=b86",
];

export default function Hero() {
  return (
    <div className="relative w-full  flex flex-col  h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={HeroBgImages[Math.floor(Math.random() * HeroBgImages.length)]}
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
          <div className="flex flex-col items-center justify-center  mb-8 ">
            <div className="relative">
              {/* <div className="absolute w-[95px] h-[75px] rounded-sm bg-black z-0 left-[50%] -translate-x-1/2 top-[49%] -translate-y-1/2 skew-x-[27deg] "></div> */}
              <div>
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={200}
                  height={200}
                  className="z-10 relative"
                />
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="text-primaryColor">Discover.</span>{" "}
            <span>Track.</span>{" "}
            <span className="text-primaryColor">Share.</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold ">Discover</span> what&#39;s hot and
            where to stream it. <span className="font-semibold ">Track</span>{" "}
            shows and movies you watch.{" "}
            <span className="font-semibold ">Share</span> comments,
            recommendations, and ratings.
          </p>

          {/* CTA Button */}
          <Link
            href="/sign-up"
            className="bg-primaryColor text-secondaryColor hover:text-neutralColor hover:bg-secondaryColor   font-semibold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex w-fit mx-auto items-center justify-center"
          >
            JOIN SEENIT FOR FREE
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
