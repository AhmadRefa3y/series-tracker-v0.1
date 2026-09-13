"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UpNextItem } from "@/types/seriesT";
import UpNextCard from "./UpNextCard";

const UpNextCarousel = ({ items }: { items: UpNextItem[] }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [order, setOrder] = useState<string[]>(() =>
    items.map((item) => item.seriesId)
  );

  // Marking an episode updates `latestWatchedAt`, so the background refresh
  // re-sorts the row. Keep the order we first rendered in and just drop shows
  // that left the list (e.g. completed), appending anything genuinely new.
  useEffect(() => {
    setOrder((prev) => {
      const incoming = items.map((item) => item.seriesId);
      const known = new Set(incoming);
      const next = prev.filter((id) => known.has(id));
      for (const id of incoming) {
        if (!next.includes(id)) next.push(id);
      }
      return next.length === prev.length &&
        next.every((id, index) => id === prev[index])
        ? prev
        : next;
    });
  }, [items]);

  const orderedItems = useMemo(() => {
    const byId = new Map(items.map((item) => [item.seriesId, item]));
    const known = new Set(order);
    const ordered = order
      .map((id) => byId.get(id))
      .filter((item): item is UpNextItem => Boolean(item));
    // Include anything the order state hasn't caught up with yet.
    for (const item of items) {
      if (!known.has(item.seriesId)) ordered.push(item);
    }
    return ordered;
  }, [items, order]);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });

    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, items.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // A little less than a full page keeps cards from being sliced in half.
    el.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <div className="group/carousel relative mt-4">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:px-6"
      >
        {orderedItems.map((item, index) => (
          <motion.div
            key={item.seriesId}
            className="snap-start"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 24,
              delay: index * 0.05,
            }}
          >
            <UpNextCard item={item} preload={index === 0} />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByPage(-1)}
        className={cn(
          "absolute left-2 top-[35%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 hover:bg-primaryColor hover:text-secondaryColor md:flex",
          canScrollLeft
            ? "opacity-0 group-hover/carousel:opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByPage(1)}
        className={cn(
          "absolute right-2 top-[35%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 hover:bg-primaryColor hover:text-secondaryColor md:flex",
          canScrollRight
            ? "opacity-0 group-hover/carousel:opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
};

export default UpNextCarousel;
