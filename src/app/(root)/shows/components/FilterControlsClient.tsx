"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Genre } from "../genresData";
import { useFilterTransition } from "../hooks/useFilterTransition";

interface FilterControlsProps {
  genres: Genre[];
}

export default function FilterControlsClient({ genres }: FilterControlsProps) {
  const searchParams = useSearchParams();
  const { isPending, updateFilters } = useFilterTransition();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(() => {
    const genreIds = searchParams.get("genreIds");
    return genreIds ? genreIds.split(",").map(Number) : [];
  });

  const [startDate, setStartDate] = useState<string>(() => {
    return searchParams.get("first_air_date.gte") || "";
  });

  const [endDate, setEndDate] = useState<string>(() => {
    return searchParams.get("first_air_date.lte") || "";
  });

  const [sort_by, setSort_by] = useState<string>(() => {
    return searchParams.get("sort_by") || "popularity.desc";
  });

  const [voteAverageGte, setVoteAverageGte] = useState<string>(() => {
    return searchParams.get("vote_average.gte") || "";
  });

  const [voteAverageLte, setVoteAverageLte] = useState<string>(() => {
    return searchParams.get("vote_average.lte") || "";
  });

  const [language, setLanguage] = useState<string>(() => {
    return searchParams.get("with_original_language") || "";
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
        params["first_air_date.gte"] = startDate;
      } else {
        params["first_air_date.gte"] = undefined;
      }

      if (endDate) {
        params["first_air_date.lte"] = endDate;
      } else {
        params["first_air_date.lte"] = undefined;
      }

      if (sort_by && sort_by !== "popularity.desc") {
        params.sort_by = sort_by;
      } else {
        params.sort_by = undefined;
      }

      if (voteAverageGte) {
        params["vote_average.gte"] = voteAverageGte;
      } else {
        params["vote_average.gte"] = undefined;
      }

      if (voteAverageLte) {
        params["vote_average.lte"] = voteAverageLte;
      } else {
        params["vote_average.lte"] = undefined;
      }

      if (language) {
        params["with_original_language"] = language;
      } else {
        params["with_original_language"] = undefined;
      }

      // Reset page to 1 when any other filter changes
      // params.page = "1";

      updateFilters(params);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    selectedGenreIds,
    startDate,
    endDate,
    sort_by,
    voteAverageGte,
    voteAverageLte,
    language,
    updateFilters,
  ]);

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
    setSort_by("popularity.desc");
    setVoteAverageGte("");
    setVoteAverageLte("");
    setLanguage("");
  };

  const isFilterActive =
    selectedGenreIds.length > 0 ||
    startDate ||
    endDate ||
    voteAverageGte ||
    voteAverageLte ||
    language;

  return (
    <div className="p-4 bg-[#1a1a1a] w-[300px] flex flex-col h-full relative">
      <div className="flex flex-col  gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Filter Shows</h2>
          {isPending && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {isFilterActive && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {/* Sort By Filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-primaryColor">
            Sort By
          </label>
          <select
            value={sort_by}
            onChange={(e) => setSort_by(e.target.value)}
            className="w-full bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
          >
            <option value="popularity.desc">Popularity (High to Low)</option>
            <option value="popularity.asc">Popularity (Low to High)</option>
            <option value="vote_count.desc">Vote Count (High to Low)</option>
            <option value="vote_count.asc">Vote Count (Low to High)</option>
            <option value="first_air_date.desc">Release Date (Newest)</option>
            <option value="first_air_date.asc">Release Date (Oldest)</option>
          </select>
        </div>
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-primaryColor">
            Genres
          </label>
          <div className="flex flex-wrap gap-2 ">
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
          <label className="block text-sm font-medium mb-1 text-primaryColor">
            Release Date
          </label>
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

        {/* Vote Average Filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-primaryColor">
            Vote Average
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Min"
              value={voteAverageGte}
              onChange={(e) => setVoteAverageGte(e.target.value)}
              className="w-full bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Max"
              value={voteAverageLte}
              onChange={(e) => setVoteAverageLte(e.target.value)}
              className="w-full bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
            />
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-primaryColor">
            Original Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>

        {/* Page Filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-primaryColor">
            Page
          </label>
          <input
            type="number"
            min="1"
            defaultValue={searchParams.get("page") || "1"}
            onChange={(e) => {
              const newPage = e.target.value || "1";
              const params: Record<string, string | undefined> = {};
              params.page = newPage;
              updateFilters(params);
            }}
            className="w-full bg-[#343434] border border-[#444444] rounded-md p-2 text-white"
          />
        </div>
      </div>
    </div>
  );
}
