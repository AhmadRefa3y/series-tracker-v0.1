"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Genre } from "../genresData";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useFilterTransition } from "../hooks/useFilterTransition";

interface FilterControlsProps {
  genres: Genre[];
}

export default function FilterControlsClient({
  genres,
}: FilterControlsProps) {
  const searchParams = useSearchParams();
  const { isPending, updateFilters } = useFilterTransition();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(() => {
    const genreIds = searchParams.get("genreIds");
    return genreIds ? genreIds.split(",").map(Number) : [];
  });
  
  const [startDate, setStartDate] = useState<string>(() => {
    return searchParams.get("startDate") || "";
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    return searchParams.get("endDate") || "";
  });
  
  const [sortBy, setSortBy] = useState<string>(() => {
    return searchParams.get("sortBy") || "popularity.desc";
  });

  // Update URL when filters change (with debounce)
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      const params: Record<string, string | undefined> = {};
      
      if (selectedGenreIds.length > 0) {
        params.genreIds = selectedGenreIds.join(",");
      } else {
        params.genreIds = undefined;
      }
      
      if (startDate) {
        params.startDate = startDate;
      } else {
        params.startDate = undefined;
      }
      
      if (endDate) {
        params.endDate = endDate;
      } else {
        params.endDate = undefined;
      }
      
      if (sortBy && sortBy !== "popularity.desc") {
        params.sortBy = sortBy;
      } else {
        params.sortBy = undefined;
      }
      
      updateFilters(params);
    }, 300);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [selectedGenreIds, startDate, endDate, sortBy]);

  const handleGenreChange = (genreId: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenreIds([]);
    setStartDate("");
    setEndDate("");
    setSortBy("popularity.desc");
  };

  const isFilterActive = selectedGenreIds.length > 0 || startDate || endDate;

  return (
    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-bold">Filter Shows</h2>
        {isFilterActive && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Genres</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedGenreIds.includes(genre.id)
                    ? "bg-[#ff5f06] text-white"
                    : "bg-[#343434] hover:bg-[#444444] text-white"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Release Date</label>
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
            />
          </div>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
          >
            <option value="popularity.desc">Popularity (High to Low)</option>
            <option value="popularity.asc">Popularity (Low to High)</option>
            <option value="first_air_date.desc">Release Date (Newest)</option>
            <option value="first_air_date.asc">Release Date (Oldest)</option>
            <option value="vote_average.desc">Rating (High to Low)</option>
            <option value="vote_average.asc">Rating (Low to High)</option>
          </select>
        </div>
        
        {/* Loading indicator */}
        {isPending && (
          <div className="flex items-center justify-center md:col-span-1 lg:col-span-1">
            <LoadingSpinner size="sm" message="Loading..." />
          </div>
        )}
      </div>
    </div>
  );
}
