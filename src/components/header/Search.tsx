"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { Search as SearchIcon, X, TrendingUp, Tv, Film, User, Star } from "lucide-react";
import Image from "next/image";
import { SearchMulti, getTrendingSeriesBasic } from "@/data/globalData";
import { Series } from "@/types/seriesT";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: number;
  name?: string;
  title?: string;
  media_type: "tv" | "movie" | "person";
  first_air_date?: string;
  release_date?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  vote_average?: number;
}

const Search: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingResults, setTrendingResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";

  const fetchTrending = useCallback(async () => {
    try {
      const data = await getTrendingSeriesBasic();
      const mapped = (data.results || []).slice(0, 5).map((item: Series) => ({
        ...item,
        id: item.id,
        name: item.name,
        media_type: "tv" as const,
      }));
      setTrendingResults(mapped);
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await SearchMulti(query);
      setSearchResults((data.results || []).slice(0, 8) as unknown as SearchResult[]);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, performSearch]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const results = searchQuery ? searchResults : trendingResults;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      const selected = results[selectedIndex];
      navigateToResult(selected);
    }
  };

  const navigateToResult = (result: SearchResult) => {
    const path = result.media_type === "tv" 
      ? `/shows/${(result.name || result.title)?.replace(/\s+/g, "_").toLowerCase()}-${result.id}`
      : result.media_type === "movie" 
        ? `/movies/${(result.title || result.name)?.replace(/\s+/g, "_").toLowerCase()}-${result.id}`
        : `/people/${(result.name || result.title)?.replace(/\s+/g, "_").toLowerCase()}-${result.id}`;
    
    router.push(path);
    setIsOpen(false);
    setSearchQuery("");
  };

  const displayResults = searchQuery ? searchResults : trendingResults;

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl z-[1000]">
      <div 
        className={cn(
          "flex items-center bg-[#1a1a1a] border border-[#333] rounded-lg transition-all duration-200 overflow-hidden",
          isOpen && "ring-2 ring-orange-500 border-transparent bg-[#222]"
        )}
      >
        <div className="pl-3 text-gray-400">
          <SearchIcon size={18} />
        </div>
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder='Search TV Shows, Movies... (Press "/" to focus)'
          className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-gray-500 h-10 w-full font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery("");
              inputRef.current?.focus();
            }}
            className="pr-3 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (displayResults.length > 0 || isLoading) && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-[#333] flex items-center justify-between bg-[#111]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              {searchQuery ? (
                <>
                  <SearchIcon size={10} /> Search Results
                </>
              ) : (
                <>
                  <TrendingUp size={10} /> Trending Today
                </>
              )}
            </span>
            {isLoading && (
              <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {displayResults.map((result, index) => (
              <div
                key={`${result.media_type}-${result.id}`}
                onClick={() => navigateToResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-[#262626] last:border-0",
                  selectedIndex === index ? "bg-[#262626]" : "hover:bg-[#222]"
                )}
              >
                <div className="relative flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-[#333]">
                  {(result.poster_path || result.profile_path) ? (
                    <Image
                      src={`${IMAGE_BASE_URL}${result.poster_path || result.profile_path}`}
                      alt={result.name || result.title || ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      {result.media_type === "person" ? <User size={16} /> : result.media_type === "movie" ? <Film size={16} /> : <Tv size={16} />}
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white truncate">
                      {result.name || result.title}
                    </h4>
                    {result.vote_average && result.vote_average > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-400/10 px-1 rounded">
                        <Star size={8} fill="currentColor" />
                        {result.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 capitalize">
                    <span className="flex items-center gap-1">
                      {result.media_type === "tv" && <Tv size={10} />}
                      {result.media_type === "movie" && <Film size={10} />}
                      {result.media_type === "person" && <User size={10} />}
                      {result.media_type === "tv" ? "TV Show" : result.media_type}
                    </span>
                    {(result.first_air_date || result.release_date) && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <span>{(result.first_air_date || result.release_date)?.split("-")[0]}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-2 bg-[#111] text-[10px] text-center text-gray-600 border-t border-[#333]">
            Use arrow keys to navigate • Enter to select • Esc to close
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
