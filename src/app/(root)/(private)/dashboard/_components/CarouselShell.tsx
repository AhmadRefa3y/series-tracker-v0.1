"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Horizontal scroll row with hover arrows and soft edge fades. Shared by
 * every dashboard carousel so they behave and breathe identically.
 */
const CarouselShell = ({
  children,
  contentKey,
}: {
  children: React.ReactNode;
  /** Changes when the row's content changes, so the arrows re-measure. */
  contentKey?: string | number;
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const cancelScrollAnimation = useCallback(() => {
    if (scrollFrame.current !== null) {
      cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
      const el = scrollerRef.current;
      if (el) el.style.scrollSnapType = "";
    }
  }, []);

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
    el.addEventListener("wheel", cancelScrollAnimation, { passive: true });
    el.addEventListener("touchstart", cancelScrollAnimation, { passive: true });

    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      el.removeEventListener("wheel", cancelScrollAnimation);
      el.removeEventListener("touchstart", cancelScrollAnimation);
      observer.disconnect();
      cancelScrollAnimation();
    };
  }, [updateArrows, contentKey, cancelScrollAnimation]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;

    cancelScrollAnimation();

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const from = el.scrollLeft;
    const halfPage = el.clientWidth * 0.85;
    let target = Math.max(
      0,
      Math.min(maxScroll, from + direction * halfPage)
    );

    // Snap to the nearest card edge, so the eased scroll lands exactly where
    // native scroll-snap would settle instead of jumping on release.
    const viewport = el.getBoundingClientRect();
    const stops = Array.from(el.children).map((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left - viewport.left + from;
    });
    if (stops.length > 0) {
      // Only consider cards in the scroll direction, otherwise a left click at
      // the start would snap forward to the first card's padding offset.
      const ahead = stops.filter((stop) =>
        direction === 1 ? stop > from + 1 : stop < from - 1
      );
      if (ahead.length > 0) {
        let nearest = ahead[0];
        for (const stop of ahead) {
          if (Math.abs(stop - target) < Math.abs(nearest - target)) {
            nearest = stop;
          }
        }
        target = nearest;
      } else {
        target = direction === 1 ? maxScroll : 0;
      }
      target = Math.max(0, Math.min(maxScroll, target));
    }

    const distance = target - from;
    if (Math.abs(distance) < 1) return;

    const duration = Math.min(520, Math.max(280, Math.abs(distance) * 0.7));
    const startTime = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const previousSnap = el.style.scrollSnapType;

    // Scroll snapping would fight the frame-by-frame animation.
    el.style.scrollSnapType = "none";

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      el.scrollLeft = from + distance * easeOut(progress);

      if (progress < 1) {
        scrollFrame.current = requestAnimationFrame(step);
      } else {
        scrollFrame.current = null;
        el.style.scrollSnapType = previousSnap;
      }
    };

    scrollFrame.current = requestAnimationFrame(step);
  };

  const arrowClass = (enabled: boolean) =>
    cn(
      "absolute top-[38%] z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white shadow-lift backdrop-blur-xl transition-all duration-300 hover:border-primaryColor/50 hover:bg-primaryColor hover:text-secondaryColor md:flex",
      enabled
        ? "opacity-0 group-hover/carousel:opacity-100"
        : "pointer-events-none opacity-0"
    );

  return (
    <div className="group/carousel relative mt-5">
      {/* Right-edge fade hints that the row keeps going without dimming the
          first card when the row is scrolled back to the start. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink-900 to-transparent transition-opacity duration-300",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        ref={scrollerRef}
        className="no-scrollbar scroll-native flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-4 md:px-6"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByPage(-1)}
        className={cn("left-3", arrowClass(canScrollLeft))}
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByPage(1)}
        className={cn("right-3", arrowClass(canScrollRight))}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
};

export default CarouselShell;
