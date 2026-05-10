"use client";
import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      <div className="flex flex-wrap items-center justify-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 w-fit shadow-2xl backdrop-blur-md">
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
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
              )}
            >
              {isButtonLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Icon size={16} />
              )}
              {filter.label}
            </button>
          );
        })}
      </div>
      
      {/* Global Loading Indicator */}
      <div className={cn(
        "h-1 w-48 bg-white/5 rounded-full overflow-hidden transition-opacity duration-300",
        isPending ? "opacity-100" : "opacity-0"
      )}>
        <div className="h-full bg-orange-500 animate-progress origin-left" />
      </div>
    </div>
  );
};

export default WatchlistFilter;
