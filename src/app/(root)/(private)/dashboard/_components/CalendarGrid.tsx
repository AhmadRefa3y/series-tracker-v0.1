"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
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

const EpisodeCard = ({
  item,
  index,
}: {
  item: UpcomingEpisodeItem;
  index: number;
}) => {
  const date = parseISO(item.airDate);
  const isNow = isToday(date);
  const badge = isNow
    ? "Today"
    : isTomorrow(date)
      ? "Tomorrow"
      : format(date, "EEE, d MMM yyyy");

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
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#17141a]">
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

          <span
            className={cn(
              "absolute left-1.5 top-1.5 z-20 rounded-md px-2 py-1 text-[11px] font-bold backdrop-blur-sm",
              isNow
                ? "bg-primaryColor text-secondaryColor"
                : "bg-black/70 text-white"
            )}
          >
            {badge}
          </span>

          {(item.runtime || item.voteAverage) && (
            <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-20 flex items-center justify-between gap-2 rounded-md bg-black/80 px-2.5 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-white">
                {item.runtime ? formatRuntime(item.runtime) : ""}
              </span>
              {item.voteAverage ? (
                <span className="flex items-center gap-1 text-xs text-white/90">
                  <Star className="size-3 fill-current" />
                  {item.voteAverage.toFixed(1)}
                </span>
              ) : null}
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

/** Upcoming episodes in one horizontal row, soonest first. */
const CalendarGrid = ({ items }: { items: UpcomingEpisodeItem[] }) => (
  <CarouselShell contentKey={items.length}>
    {items.map((item, index) => (
      <EpisodeCard
        key={`${item.seriesId}-${item.seasonNumber}-${item.episodeNumber}`}
        item={item}
        index={index}
      />
    ))}
  </CarouselShell>
);

export default CalendarGrid;
