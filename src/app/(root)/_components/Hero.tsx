import { ArrowRight, ChevronDown, Play, Sparkles } from "lucide-react";
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

const Dot = () => (
  <span aria-hidden className="size-1 rounded-full bg-white/25" />
);

export default function Hero() {
  // Picked once on the server so the markup is stable — no hydration mismatch.
  const backdrop =
    HeroBgImages[Math.floor(Math.random() * HeroBgImages.length)];

  return (
    <section className="relative isolate -mt-16 flex min-h-[100svh] w-full flex-col overflow-hidden pt-16">
      {/* Cinematic backdrop + depth layers */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src={backdrop}
          alt=""
          fill
          preload
          sizes="100vw"
          className="scale-105 object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/40 to-ink-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,7,10,0.75)_100%)]" />
        <div className="absolute inset-0 grain opacity-[0.06]" />
        <div className="absolute -top-24 left-1/2 h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-primaryColor/[0.08] blur-[130px] motion-safe:animate-aurora" />
        <div className="absolute bottom-[-12rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-[#8b5cf6]/[0.08] blur-[130px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <span className="animate-fadeIn flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 opacity-0 backdrop-blur-xl">
          <Sparkles className="size-3.5 text-primaryColor" strokeWidth={2.5} />
          Your shows · your stats · your taste
        </span>

        <div
          className="animate-fadeIn relative mt-8 opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[27deg] rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 opacity-50 blur-2xl"
          />
          <Image
            src="/logo.png"
            alt="Sennit"
            width={180}
            height={180}
            className="relative h-28 w-auto object-contain sm:h-32"
          />
        </div>

        <h1
          className="animate-fadeIn mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white opacity-0 sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="gold-text">Discover.</span> Track.{" "}
          <span className="gold-text">Share.</span>
        </h1>

        <p
          className="animate-fadeIn mt-6 max-w-2xl text-base leading-relaxed text-white/65 opacity-0 sm:text-lg"
          style={{ animationDelay: "0.3s" }}
        >
          Find what&apos;s hot and where to stream it. Track every episode you
          watch, and turn your viewing into beautiful, shareable stats.
        </p>

        <div
          className="animate-fadeIn mt-9 flex w-full flex-col items-center justify-center gap-3 opacity-0 sm:w-auto sm:flex-row"
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href="/sign-up"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primaryColor px-7 py-3.5 text-sm font-bold text-secondaryColor shadow-gold transition-transform duration-200 hover:scale-[1.03] sm:w-auto sm:text-base"
          >
            Join Sennit — it&apos;s free
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/shows"
            className="group/ghost inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-white/85 backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1] hover:text-white sm:w-auto sm:text-base"
          >
            <Play className="size-4 fill-current" />
            Explore shows
          </Link>
        </div>

        <div
          className="animate-fadeIn mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35 opacity-0"
          style={{ animationDelay: "0.5s" }}
        >
          <span>Free forever</span>
          <Dot />
          <span>Track shows &amp; movies</span>
          <Dot />
          <span>Deep stats</span>
        </div>
      </div>

      <div className="relative flex justify-center pb-10">
        <span className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 motion-safe:animate-float">
          Scroll
          <ChevronDown className="size-4" />
        </span>
      </div>
    </section>
  );
}
