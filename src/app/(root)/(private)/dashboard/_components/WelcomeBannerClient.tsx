"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  CalendarRange,
  ChevronRight,
  UserRound,
} from "lucide-react";

import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";

type Stats = { seriesWatched: number; episodesWatched: number };

/** The four destinations the old banner linked to — same hrefs, richer cards. */
const NAV_ITEMS = [
  {
    title: "2025 Year to Date",
    subtitle: "Your yearly stats",
    href: "/",
    icon: CalendarRange,
  },
  {
    title: "All Time Stats",
    subtitle: "Every episode ever",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Apr Month in Review",
    subtitle: "April, recapped",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Your Profile",
    subtitle: "Account & settings",
    href: "/",
    icon: UserRound,
  },
] satisfies { title: string; subtitle: string; href: string; icon: LucideIcon }[];

/** Soft cinematic depth: two radial glows + a faint vignette. Pure CSS. */
const BackgroundDepth = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-32 left-1/4 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primaryColor/[0.05] blur-3xl" />
    <div className="absolute -bottom-40 right-[8%] h-64 w-[28rem] rounded-full bg-[#a78bfa]/[0.04] blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(23,20,26,0.6)_75%)]" />
  </div>
);

const Avatar = ({ src, name }: { src: string; name: string }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative shrink-0"
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Animated conic ring — slow, subtle, gold. */}
      <motion.span
        aria-hidden
        className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(252,211,77,0.55)_60deg,transparent_140deg,rgba(252,211,77,0.35)_240deg,transparent_320deg)]"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      />
      <span
        aria-hidden
        className="absolute -inset-1.5 rounded-full bg-[#17141a]"
        style={{ mask: "radial-gradient(circle, transparent 62%, black 63%)", WebkitMask: "radial-gradient(circle, transparent 62%, black 63%)" }}
      />
      {/* Soft glow behind the avatar. */}
      <span
        aria-hidden
        className="absolute -inset-2 rounded-full bg-primaryColor/15 blur-xl"
      />

      <Image
        src={src}
        alt={`${name}'s avatar`}
        width={76}
        height={76}
        className="relative size-[68px] rounded-full object-cover ring-1 ring-white/15 sm:size-[76px]"
      />
    </motion.div>
  );
};

const NavCard = ({
  title,
  subtitle,
  href,
  icon: Icon,
  index,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  index: number;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 24,
        delay: reduceMotion ? 0 : 0.08 + index * 0.06,
      }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      <Link
        href={href}
        className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3 outline-none transition-colors duration-300 hover:border-primaryColor/40 hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-primaryColor/70"
      >
        {/* Sweep highlight on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />

        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor transition-colors duration-300 group-hover:bg-primaryColor group-hover:text-secondaryColor">
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold leading-tight text-white">
            {title}
          </span>
          <span className="block truncate text-[11px] text-white/45">
            {subtitle}
          </span>
        </span>

        <ChevronRight
          className="size-4 shrink-0 text-white/35 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primaryColor"
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  );
};

const WelcomeBannerClient = ({
  userName,
  memberSince,
  avatarUrl,
  stats,
}: {
  userName: string;
  memberSince: Date;
  avatarUrl: string;
  stats: Stats;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      <BackgroundDepth />

      <div className="container relative mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Left: identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar src={avatarUrl} name={userName} />

            <div className="min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 24,
                  delay: reduceMotion ? 0 : 0.05,
                }}
                className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-[34px]"
              >
                Hello,{" "}
                <span className="bg-gradient-to-r from-primaryColor via-[#fde68a] to-primaryColor bg-clip-text text-transparent [background-size:200%_auto] motion-safe:animate-[shimmer_6s_linear_infinite]">
                  {userName}
                </span>
              </motion.h1>

              <p className="mt-1.5 text-sm text-white/50">
                Member since{" "}
                <span className="font-medium text-white/70">
                  {format(memberSince, "MMM d, yyyy")}
                </span>
              </p>

              <div className="mt-3 flex items-center gap-2.5">
                {[
                  { label: "Shows", value: stats.seriesWatched },
                  { label: "Episodes", value: stats.episodesWatched },
                ].map((stat) => (
                  <span
                    key={stat.label}
                    className="inline-flex items-baseline gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/60"
                  >
                    <span className="font-bold text-primaryColor">
                      {stat.value}
                    </span>
                    {stat.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: navigation cards */}
          <nav
            aria-label="Dashboard shortcuts"
            className="grid w-full gap-2.5 sm:grid-cols-2 lg:max-w-xl lg:flex-1"
          >
            {NAV_ITEMS.map((item, index) => (
              <NavCard
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
                href={item.href}
                icon={item.icon}
                index={index}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBannerClient;
