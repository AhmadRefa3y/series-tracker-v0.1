"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { UpNextItem } from "@/types/seriesT";
import CarouselShell from "./CarouselShell";
import UpNextCard from "./UpNextCard";

const UpNextCarousel = ({ items }: { items: UpNextItem[] }) => {
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

  return (
    <CarouselShell contentKey={orderedItems.length}>
      {/* AnimatePresence animates cards in/out when shows complete & leave the row */}
      <AnimatePresence initial={false} mode="popLayout">
        {orderedItems.map((item, index) => (
          <motion.div
            key={item.seriesId}
            layout
            className="snap-start"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
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
      </AnimatePresence>
    </CarouselShell>
  );
};

export default UpNextCarousel;
