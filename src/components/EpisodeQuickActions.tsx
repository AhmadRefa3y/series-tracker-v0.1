"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { markEpisodWatched } from "@/app/(root)/(private)/watchlist/actions";
import { unMarkEpisodeWatched } from "@/app/(root)/shows/actions";
import { cn } from "@/lib/utils";

interface EpisodeQuickActionsProps {
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  isWatched: boolean;
  /** Episode page opened by the play action. */
  href: string;
  /** Keeps the parent list's own watched state in sync. */
  onToggle?: (watched: boolean) => void;
  className?: string;
}

const actionClass =
  "flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-primaryColor hover:text-secondaryColor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/60 disabled:opacity-60";

/**
 * Quick actions rendered over an episode card. Buttons (not links) so they can
 * live inside a card whose whole surface is already a link without nesting
 * anchors, and so the card's own navigation is never triggered twice.
 */
const EpisodeQuickActions = ({
  seriesId,
  seasonNumber,
  episodeNumber,
  isWatched,
  href,
  onToggle,
  className,
}: EpisodeQuickActionsProps) => {
  const router = useRouter();
  const [watched, setWatched] = useState(isWatched);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWatched(isWatched);
  }, [isWatched]);

  const handleOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(href);
  };

  const handleToggleWatched = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;

    const next = !watched;
    setLoading(true);
    setWatched(next);

    try {
      const payload = {
        episodeData: { seriesID: seriesId, episodeNumber, seasonNumber },
      };
      const result = next
        ? await markEpisodWatched(payload)
        : await unMarkEpisodeWatched(payload);

      if (!result.success) {
        setWatched(!next);
        toast.error(result.message || "Something went wrong");
        return;
      }

      onToggle?.(next);
      toast.success(
        next ? "Episode marked as watched" : "Episode unmarked as watched"
      );
      router.refresh();
    } catch {
      setWatched(!next);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open episode"
        title="Open episode"
        className={actionClass}
      >
        <Play className="size-4" strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={handleToggleWatched}
        disabled={loading}
        aria-pressed={watched}
        aria-label={watched ? "Mark episode as unwatched" : "Mark episode as watched"}
        title={watched ? "Watched — click to undo" : "Mark as watched"}
        className={cn(
          actionClass,
          watched &&
            "border-transparent bg-primaryColor text-secondaryColor hover:bg-primaryColor"
        )}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" strokeWidth={3} />
        )}
      </button>
    </div>
  );
};

export default EpisodeQuickActions;
