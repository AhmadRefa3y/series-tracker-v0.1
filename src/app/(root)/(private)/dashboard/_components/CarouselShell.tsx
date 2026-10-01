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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [updateArrows, contentKey]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // A little less than a full page keeps cards from being sliced in half.
    el.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: "smooth",
    });
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
      {/* Edge fades hint that the row keeps going. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-ink-900 to-transparent transition-opacity duration-300",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink-900 to-transparent transition-opacity duration-300",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        ref={scrollerRef}
        className="no-scrollbar scroll-native flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-3 pt-1 md:px-6"
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
