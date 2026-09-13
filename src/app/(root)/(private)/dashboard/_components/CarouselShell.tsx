"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Horizontal scroll row with hover arrows. Shared by Continue Watching and
 * History so both sections keep the exact same layout and behaviour.
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

  return (
    <div className="group/carousel relative mt-4">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:px-6"
      >
        {children}
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

export default CarouselShell;
