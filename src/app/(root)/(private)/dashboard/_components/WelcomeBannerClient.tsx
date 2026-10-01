"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Clock,
  Flame,
  Layers,
  Play,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Stats = {
  seriesWatched: number;
  episodesWatched: number;
  minutesWatched: number;
  weeklyActivity: number[];
};

/** Soft app-like ease used for entrance tweens (springs handle the rest). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

/** Avatar with a slow gold conic ring and a soft halo. */
const Avatar = ({ src, name }: { src: string; name: string }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative shrink-0"
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <span
        aria-hidden
        className="absolute -inset-2 rounded-full bg-primaryColor/20 blur-xl"
      />
      <motion.span
        aria-hidden
        className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(252,211,77,0.6)_60deg,transparent_140deg,rgba(252,211,77,0.38)_240deg,transparent_320deg)]"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      />
      <span
        aria-hidden
        className="absolute -inset-1.5 rounded-full bg-ink-900"
        style={{
          mask: "radial-gradient(circle, transparent 62%, black 63%)",
          WebkitMask: "radial-gradient(circle, transparent 62%, black 63%)",
        }}
      />

      <Image
        src={src}
        alt={`${name}'s avatar`}
        width={80}
        height={80}
        className="relative size-[68px] rounded-full object-cover ring-1 ring-white/15 sm:size-[76px]"
      />
    </motion.div>
  );
};

/** Editorial stat card with a hover sweep, linking into the relevant page. */
const StatCard = ({
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 26,
        delay: reduceMotion ? 0 : 0.14 + index * 0.06,
      }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="h-full"
    >
      <Link
        href={href}
        className="group relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 shadow-inset outline-none backdrop-blur-xl transition-colors duration-300 hover:border-primaryColor/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-primaryColor/70"
      >
        {/* Sweep highlight on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />

        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          <Icon className="size-3.5 text-primaryColor" strokeWidth={2.5} />
          {label}
        </span>

        <span className="text-3xl font-black leading-none tracking-tight text-white">
          {value}
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
  backdropUrl,
  stats,
}: {
  userName: string;
  memberSince: Date;
  avatarUrl: string;
  backdropUrl: string | null;
  stats: Stats;
}) => {
  const reduceMotion = useReducedMotion();

  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "Late night"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

  // Weekly mini chart: scale bars against the busiest day, min height for zero days.
  const peak = Math.max(1, ...stats.weeklyActivity);
  const weekTotal = stats.weeklyActivity.reduce((a, b) => a + b, 0);

  const hoursTotal = Math.floor(stats.minutesWatched / 60);
  const daysTotal = Math.floor(hoursTotal / 24);
  const hoursRemainder = hoursTotal % 24;
  const watchTimeValue =
    daysTotal > 0 ? `${daysTotal}d ${hoursRemainder}h` : `${hoursTotal}h`;

  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16">
      {/* Cinematic backdrop: the user's latest show, heavily veiled. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            preload
            sizes="100vw"
            className="object-cover object-center opacity-[0.22]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/85 to-ink-900" />
        <div className="absolute inset-0 grain opacity-[0.05]" />
        <div className="absolute -top-32 left-1/4 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primaryColor/[0.08] blur-[120px] motion-safe:animate-aurora" />
        <div className="absolute -bottom-40 right-[4%] h-64 w-[30rem] rounded-full bg-[#8b5cf6]/[0.07] blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 pb-8 pt-10 sm:pt-14 lg:pb-12 lg:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          {/* Left: identity + weekly activity */}
          <div className="flex min-w-0 flex-1 flex-col gap-8 lg:max-w-2xl">
            <div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex items-center gap-4 sm:gap-5"
              >
                <Avatar src={avatarUrl} name={userName} />

                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primaryColor/85">
                    <Flame className="size-3" strokeWidth={2.5} />
                    {greeting}
                  </p>
                  <h1 className="mt-1.5 truncate text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
                    {userName}
                  </h1>
                  <p className="mt-1.5 text-sm text-white/50">
                    Member since{" "}
                    <span className="font-medium text-white/70">
                      {format(memberSince, "MMM d, yyyy")}
                    </span>
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
                className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/60"
              >
                Your watch universe, all in one place — pick up where you left
                off, see what&apos;s next, and track everything you love.
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <Link
                  href="#continue-watching"
                  className="group inline-flex items-center gap-2 rounded-full bg-primaryColor px-6 py-3 text-sm font-bold text-secondaryColor shadow-gold transition-transform duration-200 hover:scale-[1.03]"
                >
                  <Play className="size-4 fill-secondaryColor" strokeWidth={2.5} />
                  Resume watching
                </Link>
                <Link
                  href="/insights"
                  className="group/ghost inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  <Trophy className="size-4 text-primaryColor" strokeWidth={2.5} />
                  Your insights
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/ghost:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            {/* Weekly activity card — Trakt-style bar strip, gold gradient. */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 shadow-inset backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  <Flame className="size-3.5 text-primaryColor" strokeWidth={2.5} />
                  This week
                </span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-semibold text-white/60">
                  {weekTotal} episode{weekTotal === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex h-20 items-end gap-2">
                {stats.weeklyActivity.map((count, index) => (
                  <div
                    key={index}
                    className="group flex flex-1 flex-col items-center gap-2"
                    title={`${count} episode${count === 1 ? "" : "s"}`}
                  >
                    <motion.div
                      className={cn(
                        "w-full rounded-t-md",
                        count > 0
                          ? "bg-gradient-to-t from-gold-deep/50 via-primaryColor to-[#fde68a] shadow-[0_0_18px_-6px_rgba(252,211,77,0.6)]"
                          : "bg-white/[0.06]"
                      )}
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max(
                          (count / peak) * 100,
                          count > 0 ? 12 : 5
                        )}%`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 26,
                        delay: reduceMotion ? 0 : 0.35 + index * 0.05,
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

          {/* Right: stat cards + CTA */}
          <nav
            aria-label="Dashboard shortcuts"
            className="grid w-full shrink-0 content-end gap-3 sm:grid-cols-2 lg:w-[27rem]"
          >
            <StatCard
              index={0}
              value={stats.seriesWatched}
              label="Shows"
              sub={`${stats.seriesWatched} show${
                stats.seriesWatched === 1 ? "" : "s"
              } tracked`}
              href="/watchlist"
              icon={Layers}
            />
            <StatCard
              index={1}
              value={stats.episodesWatched}
              label="Episodes"
              sub="Marked as watched"
              href="/history"
              icon={Activity}
            />
            <StatCard
              index={2}
              value={watchTimeValue}
              label="Watch time"
              sub="Estimated from runtimes"
              href="/insights"
              icon={Clock}
            />
            <StatCard
              index={3}
              value={weekTotal}
              label="This week"
              sub="Episodes in the last 7 days"
              href="/insights"
              icon={Flame}
            />

            <Link
              href="/insights"
              className="group/cta flex items-center justify-between gap-3 rounded-2xl border border-primaryColor/25 bg-primaryColor/[0.07] px-4 py-3.5 transition-all duration-300 hover:border-primaryColor/50 hover:bg-primaryColor/[0.12] sm:col-span-2"
            >
              <span className="text-[13px] font-bold text-primaryColor">
                View your full stats &amp; taste profile
              </span>
              <ArrowRight className="size-4 shrink-0 text-primaryColor transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </nav>
        </div>
      </div>

      {/* Soft fade into the page background so the hero melts into the rail. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink-900"
      />
    </section>
  );
};

export default WelcomeBannerClient;
