"use client";
import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, PlayCircle, XCircle, Loader2, ListPlus } from "lucide-react";

const WatchlistFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);
  const currentStatus = searchParams.get("status") || "watching";

  const setFilter = (status: string) => {
    setPendingStatus(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);

    startTransition(() => {
      // Use replace + refresh to aggressively bust the client-side router cache
      router.replace(`/watchlist?${params.toString()}`);
      router.refresh();
    });
  };

  const filters = [
    { id: "watching", label: "Watching", icon: PlayCircle },
    { id: "completed", label: "Completed", icon: CheckCircle2 },
    { id: "plan_to_watch", label: "Plan to Watch", icon: ListPlus },
    { id: "dropped", label: "Dropped", icon: XCircle },
  ];

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/[0.07] w-fit shadow-2xl backdrop-blur-md">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = currentStatus === filter.id;
          const isButtonLoading = isPending && pendingStatus === filter.id;

          return (
            <button
              key={filter.id}
              disabled={isPending}
              onClick={() => setFilter(filter.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/60",
                isActive
                  ? "text-secondaryColor"
                  : "text-white/50 hover:text-white disabled:opacity-50"
              )}
            >
              {/* Sliding gold pill behind the active filter — Trakt-style */}
              {isActive && (
                <motion.span
                  layoutId="watchlist-filter-pill"
                  className="absolute inset-0 rounded-xl bg-primaryColor shadow-lg shadow-primaryColor/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isButtonLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}
                {filter.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Global Loading Indicator */}
      <div
        className={cn(
          "h-1 w-48 overflow-hidden rounded-full bg-white/5 transition-opacity duration-300",
          isPending ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-full w-full origin-left animate-progress bg-primaryColor" />
      </div>
    </div>
  );
};

export default WatchlistFilter;
