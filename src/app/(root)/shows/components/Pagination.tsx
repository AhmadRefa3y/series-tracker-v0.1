"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPageProp: number;
  totalPagesProp: number;
}

export default function Pagination({
  currentPageProp,
  totalPagesProp,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = Math.max(1, Number(currentPageProp) || 1);
  const totalPages = Math.max(1, Number(totalPagesProp) || 1);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | "...")[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) rangeWithDots.push(1, "...");
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1)
      rangeWithDots.push("...", totalPages);
    else rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const navButtonClass =
    "inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 py-8"
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className={navButtonClass}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="px-1 text-sm text-white/30">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            disabled={isPending}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-xl text-sm font-semibold transition-all",
              page === currentPage
                ? "bg-primaryColor text-secondaryColor shadow-lg shadow-primaryColor/20"
                : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className={navButtonClass}
      >
        <span className="hidden sm:inline">Next</span>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>
    </nav>
  );
}
