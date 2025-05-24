"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { Search as SearchIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import Image from "next/image";
import { SearchSeries } from "@/data/tmdb";

// Define the TMDB Series type
interface Series {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path?: string | null;
}

// Define TMDB API response type

const Search: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_KEY: string =
    process.env.NEXT_PUBLIC_TMDB_API_KEY || "your-api-key-here";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
  const IMAGE_SIZE = "w92";

  // Focus input when popover opens with a slight delay
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use setTimeout to ensure focus happens after popover render
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchSeries = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const getSeries = await SearchSeries(searchQuery);

      setSearchResults(getSeries.results || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery || !isOpen) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSeries();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isOpen, fetchSeries]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleTriggerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent any default behavior that might steal focus
    setIsOpen(true);
  };

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 w-full h-screen z-[999]"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      <div
        className={`relative hidden md:block group bg-[#343434] z-[999] hover:bg-white duration-200 ${
          !isOpen ? "rounded-md " : "rounded-t-md text-black"
        }`}
      >
        <Popover open={isOpen}>
          <PopoverTrigger asChild>
            <div
              className="relative cursor-pointer"
              onClick={handleTriggerClick}
            >
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 group-hover:text-black" />
              <Input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search for a series..."
                className={`w-[200px] pl-8 md:w-[300px] duration-200 focus:ring-0 focus:outline-none border-0 placeholder:text-white hover:placeholder:text-black hover:text-black cursor-pointer placeholder:capitalize ${
                  isOpen
                    ? "placeholder:text-black text-black bg-white rounded-none rounded-t-md focus:border-b focus:border-fuchsia-600"
                    : ""
                }`}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Escape") setIsOpen(false);
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] md:w-[300px] p-0 shadow-none rounded-t-none border-t-0"
            align="start"
            sideOffset={0}
          >
            <div className="h-[300px] p-2 overflow-y-auto shadow-2xl">
              {isLoading && <div className="p-2 text-center">Loading...</div>}
              {!isLoading && searchResults.length === 0 && searchQuery && (
                <div className="p-2 text-center">No results found</div>
              )}
              {!isLoading && searchResults.length > 0 && (
                <ul className="space-y-2">
                  {searchResults.map((series: Series) => (
                    <li key={series.id}>
                      <Link
                        href={`/shows/${series.name}-${series.id}`}
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-3"
                      >
                        {series.poster_path ? (
                          <Image
                            src={`${IMAGE_BASE_URL}${IMAGE_SIZE}${series.poster_path}`}
                            alt={`${series.name} poster`}
                            className="w-12 h-16 object-cover rounded"
                            width={48}
                            height={64}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{series.name}</div>
                          <div className="text-sm text-gray-600">
                            {series.first_air_date?.split("-")[0] || "N/A"}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Search;
