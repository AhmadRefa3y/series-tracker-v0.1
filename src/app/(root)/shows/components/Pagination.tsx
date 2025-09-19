"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const currentPage = Number(currentPageProp);
  const totalPages = Number(totalPagesProp);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    router.replace(createPageUrl(page));
  };

  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center py-6 gap-2">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${
          currentPage === 1
            ? "text-gray-500 cursor-not-allowed"
            : "text-white hover:bg-[#343434]"
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && goToPage(page)}
          disabled={page === "..."}
          className={`px-4 py-2 rounded-md ${
            page === currentPage
              ? "bg-[#ff5f06] text-white"
              : page === "..."
              ? "cursor-default text-gray-500"
              : "text-white hover:bg-[#343434]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${
          currentPage === totalPages
            ? "text-gray-500 cursor-not-allowed"
            : "text-white hover:bg-[#343434]"
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
