"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import FilterPanel from "./FilterPanel";
import { useShowFilters } from "./ShowFiltersProvider";

export function FilterSidebar() {
  return (
    <aside className="hidden w-[300px] shrink-0 lg:block">
      <div className="custom-scrollbar sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#1c1820] shadow-2xl shadow-black/30">
        <FilterPanel />
      </div>
    </aside>
  );
}

export function MobileFilterButton() {
  const [open, setOpen] = useState(false);
  const { activeCount, isPending } = useShowFilters();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors lg:hidden",
          activeCount > 0
            ? "border-primaryColor/50 bg-primaryColor/10 text-primaryColor"
            : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        )}
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 ? (
          <span className="rounded-full bg-primaryColor px-1.5 text-[10px] font-bold text-secondaryColor">
            {activeCount}
          </span>
        ) : null}
      </button>

      <SheetContent
        side="left"
        className="w-full max-w-sm gap-0 border-white/[0.06] bg-[#17141a] p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-white/[0.06]">
          <SheetTitle className="text-white">Advanced filters</SheetTitle>
        </SheetHeader>
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <FilterPanel />
        </div>
        <div className="border-t border-white/[0.06] p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primaryColor py-2.5 text-sm font-bold text-secondaryColor transition-opacity hover:opacity-90"
          >
            {isPending ? "Updating…" : "Show results"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
