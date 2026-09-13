import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

import EpisodeQuickActions from "@/components/EpisodeQuickActions";
import type { WatchHistoryItem } from "@/app/(root)/(private)/dashboard/DashbaordData";

const formatRuntime = (minutes?: number | null) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/** Compact relative time ("2d ago") so it fits the card's overlay chip. */
const formatWatchedAt = (date: Date) => {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(date).getTime()) / 60000)
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(days / 365)}y ago`;
};

const HistoryCard = ({
  item,
  sizes = "(max-width: 640px) 272px, 300px",
}: {
  item: WatchHistoryItem;
  sizes?: string;
}) => {
  const seriesSlug = item.seriesTitle.replace(/\s+/g, "_").toLowerCase();
  const href = `/shows/${seriesSlug}-${item.seriesTmdbId}/episode/${item.seriesTmdbId}-${item.seasonNumber}-${item.episodeNumber}`;
  const episodeLabel = `S${item.seasonNumber} • E${item.episodeNumber}${
    item.name ? ` - ${item.name}` : ""
  }`;
  const image = item.stillUrl || item.posterUrl;
  const runtime = formatRuntime(item.runtime);

  return (
    <article className="group/card w-full">
      <div className="relative">
        <Link
          href={href}
          aria-label={`${item.seriesTitle} ${episodeLabel}`}
          className="relative block aspect-video overflow-hidden rounded-lg bg-[#17141a]"
        >
          {image ? (
            <Image
              src={image}
              alt={item.seriesTitle}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5">
              <Clock className="size-5 text-white/30" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-20 flex items-center justify-between gap-2 rounded-md bg-black/80 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold text-white">{runtime}</span>
            <span className="text-xs text-white/90">
              {formatWatchedAt(item.watchedAt)}
            </span>
          </div>
        </Link>

        {/* Quick actions */}
        <div className="absolute right-1.5 top-1.5 z-30">
          <EpisodeQuickActions
            seriesId={item.seriesTmdbId}
            seasonNumber={item.seasonNumber}
            episodeNumber={item.episodeNumber}
            isWatched
            href={href}
          />
        </div>
      </div>

      <div className="mt-2.5 min-w-0">
        <h3 className="truncate text-[15px] font-bold leading-tight text-white">
          {item.seriesTitle}
        </h3>
        <p className="mt-1 truncate text-[13px] text-white/50">
          {episodeLabel}
        </p>
      </div>
    </article>
  );
};

export default HistoryCard;
