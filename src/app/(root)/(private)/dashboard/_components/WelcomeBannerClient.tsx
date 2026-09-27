"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Flame,
  Layers,
  Trophy,
} from "lucide-react";

import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";

type Stats = {
  seriesWatched: number;
  episodesWatched: number;
  minutesWatched: number;
  weeklyActivity: number[];
};

/** Weekday labels for the weekly mini chart, oldest first (6 days ago … today). */
const WEEKDAY_LABELS = (() => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    labels.push(format(day, "EEEEE"));
  }
  return labels;
})();

/** Soft cinematic depth: two radial glows + a faint vignette. Pure CSS. */
const BackgroundDepth = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
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
        style={{
          mask: "radial-gradient(circle, transparent 62%, black 63%)",
          WebkitMask: "radial-gradient(circle, transparent 62%, black 63%)",
        }}
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

/** Large bordered stat block, Trakt-profile style. */
const StatBlock = ({
  value,
  label,
  sub,
  href,
  icon: Icon,
  index,
}: {
  value: string | number;
  label: string;
  sub: string;
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
        className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 outline-none transition-colors duration-300 hover:border-primaryColor/40 hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-primaryColor/70"
      >
        {/* Sweep highlight on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />

        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <Icon className="size-3.5 text-primaryColor" strokeWidth={2.5} />
          {label}
        </span>

        <span className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black leading-none text-white">
            {value}
          </span>
        </span>

        <span className="text-[11px] text-white/45">{sub}</span>
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

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Weekly mini chart: scale bars against the busiest day, min height for zero days.
  const peak = Math.max(1, ...stats.weeklyActivity);

  const hoursTotal = Math.floor(stats.minutesWatched / 60);
  const daysTotal = Math.floor(hoursTotal / 24);
  const hoursRemainder = hoursTotal % 24;

  return (
    <div className="relative overflow-hidden">
      <BackgroundDepth />

      <div className="container relative mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* Left: identity + weekly chart */}
          <div className="flex flex-col gap-6 lg:max-w-md">
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
                  {greeting},{" "}
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
              </div>
            </div>

            {/* Weekly activity mini chart — Trakt-style bar strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 24,
                delay: reduceMotion ? 0 : 0.12,
              }}
              className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Flame className="size-3.5 text-primaryColor" strokeWidth={2.5} />
                  This week
                </span>
                <span className="text-[11px] font-semibold text-white/60">
                  {stats.weeklyActivity.reduce((a, b) => a + b, 0)} episodes
                </span>
              </div>
              <div className="flex h-16 items-end gap-2">
                {stats.weeklyActivity.map((count, index) => (
                  <div
                    key={index}
                    className="group flex flex-1 flex-col items-center gap-1.5"
                    title={`${count} episode${count === 1 ? "" : "s"}`}
                  >
                    <motion.div
                      className="w-full rounded-t-sm bg-gradient-to-t from-primaryColor/40 to-primaryColor transition-colors duration-300 group-hover:from-primaryColor/60"
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max((count / peak) * 100, count > 0 ? 10 : 4)}%`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 26,
                        delay: reduceMotion ? 0 : 0.3 + index * 0.05,
                      }}
                    />
                    <span className="text-[9px] font-semibold uppercase text-white/35">
                      {WEEKDAY_LABELS[index]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: stat blocks */}
          <nav
            aria-label="Dashboard shortcuts"
            className="grid w-full gap-2.5 sm:grid-cols-2 lg:max-w-xl lg:flex-1"
          >
            <StatBlock
              index={0}
              value={stats.seriesWatched}
              label="Shows"
              sub={`${stats.seriesWatched} show${stats.seriesWatched === 1 ? "" : "s"} tracked`}
              href="/watchlist"
              icon={Layers}
            />
            <StatBlock
              index={1}
              value={stats.episodesWatched}
              label="Episodes"
              sub="Marked as watched"
              href="/history"
              icon={Activity}
            />
            <StatBlock
              index={2}
              value={
                daysTotal > 0
                  ? `${daysTotal}d ${hoursRemainder}h`
                  : `${hoursTotal}h`
              }
              label="Watch time"
              sub="Estimated from runtimes"
              href="/insights"
              icon={Trophy}
            />
            <StatBlock
              index={3}
              value={stats.weeklyActivity.reduce((a, b) => a + b, 0)}
              label="This week"
              sub="Episodes in the last 7 days"
              href="/insights"
              icon={Flame}
            />
            {/* Chevron arrow row to insights, Trakt CTA style */}
            <Link
              href="/insights"
              className="group/cta flex items-center justify-between gap-3 rounded-xl border border-primaryColor/20 bg-primaryColor/[0.06] px-4 py-3 transition-colors duration-300 hover:border-primaryColor/50 hover:bg-primaryColor/10 sm:col-span-2"
            >
              <span className="text-[13px] font-bold text-primaryColor">
                View your full stats &amp; taste profile
              </span>
              <ArrowRight className="size-4 shrink-0 text-primaryColor transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBannerClient;
