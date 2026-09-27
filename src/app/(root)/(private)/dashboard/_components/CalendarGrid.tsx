"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  format,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UpcomingEpisodeItem } from "@/types/seriesT";
import CarouselShell from "./CarouselShell";

const formatRuntime = (minutes: number) => {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/** Trakt-calendar style day heading: "Today · Wed, 23 Sep". */
const dayHeading = (airDate: string) => {
  const date = parseISO(airDate);
  const relative = isToday(date)
    ? "Today"
    : isTomorrow(date)
      ? "Tomorrow"
      : format(date, "EEEE");
  return `${relative} · ${format(date, "d MMM")}`;
};

const EpisodeCard = ({
  item,
  index,
}: {
  item: UpcomingEpisodeItem;
  index: number;
}) => {
  const episodeLabel = `S${item.seasonNumber} • E${item.episodeNumber}`;
  const href = `/shows/${item.title.replace(/\s+/g, "_").toLowerCase()}-${item.seriesId}/episode/${item.seriesId}-${item.seasonNumber}-${item.episodeNumber}`;

  return (
    <motion.article
      className="w-[272px] shrink-0 snap-start sm:w-[300px]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 24,
        // Capped so long lists don't leave the last cards waiting.
        delay: Math.min(index * 0.05, 0.5),
      }}
    >
      <Link href={href} className="group block">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#1d1922] ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-primaryColor/40">
          <Image
            src={
              item.stillUrl ??
              item.posterUrl ??
              "https://image.tmdb.org/t/p/w780/wwemzKWzjKYJFfCeiB57q3r4Bcm.png"
            }
            alt={item.name || item.title}
            fill
            sizes="(max-width: 640px) 272px, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />

          {/* Air time chip */}
          <span
            className={cn(
              "absolute left-1.5 top-1.5 z-20 rounded-md px-2 py-1 text-[11px] font-bold backdrop-blur-sm",
              isToday(parseISO(item.airDate))
                ? "bg-primaryColor text-secondaryColor"
                : "bg-black/70 text-white"
            )}
          >
            {format(parseISO(item.airDate), "p")}
          </span>

          {(item.runtime || item.voteAverage || item.imdbRating) && (
            <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-20 flex items-center justify-between gap-2 rounded-md bg-black/80 px-2.5 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-white">
                {item.runtime ? formatRuntime(item.runtime) : ""}
              </span>
              <span className="flex items-center gap-2">
                {item.voteAverage ? (
                  <span className="flex items-center gap-1 text-xs text-white/90">
                    <Star className="size-3 fill-current" />
                    {item.voteAverage.toFixed(1)}
                  </span>
                ) : null}
                {item.imdbRating ? (
                  <span
                    className="rounded bg-[#f5c518] px-1 py-0.5 text-[10px] font-black leading-none text-black"
                    title={`IMDb ${item.imdbRating}`}
                  >
                    IMDb {item.imdbRating}
                  </span>
                ) : null}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5">
          <h3 className="truncate text-[15px] font-bold leading-tight text-white">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[13px] text-white/50">
            {episodeLabel}
            {item.name ? ` - ${item.name}` : ""}
          </p>
        </div>
      </Link>
    </motion.article>
  );
};

/**
 * Upcoming episodes grouped under Trakt-style day headings, soonest first.
 * Items must already be sorted by airDate (the data layer guarantees this).
 */
const CalendarGrid = ({ items }: { items: UpcomingEpisodeItem[] }) => {
  const groups: { heading: string; items: UpcomingEpisodeItem[] }[] = [];

  for (const item of items) {
    const heading = dayHeading(item.airDate);
    const current = groups[groups.length - 1];
    if (current && current.heading === heading) {
      current.items.push(item);
    } else {
      groups.push({ heading, items: [item] });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.heading}>
          {/* Day divider — Trakt calendar style */}
          <div className="flex items-center gap-3 px-4 md:px-6">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-widest",
                group.heading.startsWith("Today")
                  ? "text-primaryColor"
                  : "text-white/40"
              )}
            >
              {group.heading}
            </span>
            <span className="h-px flex-1 bg-white/[0.07]" />
            <span className="text-[10px] font-semibold text-white/30">
              {group.items.length} episode{group.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <CarouselShell contentKey={`${group.heading}-${group.items.length}`}>
            {group.items.map((item, index) => (
              <EpisodeCard
                key={`${item.seriesId}-${item.seasonNumber}-${item.episodeNumber}`}
                item={item}
                index={index}
              />
            ))}
          </CarouselShell>
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
