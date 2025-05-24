import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { DialogHeader } from "./ui/dialog";
import { Separator } from "./ui/separator";

const SeriesDetailsSkeleton = () => {
  return (
    <ScrollArea className="max-h-[90vh]">
      <div className="p-6">
        <DialogHeader className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-[200px] h-[300px] bg-gray-200 animate-pulse rounded-md" />
            </div>

            {/* Right Section Skeleton */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                {/* Title Skeleton */}
                <div className="w-3/4 h-8 bg-gray-200 animate-pulse rounded" />
                {/* Rating Skeleton */}
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-gray-200 animate-pulse rounded-full" />
                  <div className="w-12 h-4 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>

              {/* Genres and Year Skeleton */}
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
                <div className="w-20 h-6 bg-gray-200 animate-pulse rounded" />
                <div className="w-14 h-6 bg-gray-200 animate-pulse rounded" />
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Description Skeleton */}
              <div className="mt-4 space-y-2">
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-5/6 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Creator and Starring Skeleton */}
              <div className="mt-4 grid gap-2">
                <div className="w-2/3 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Button Skeleton */}
              <div className="mt-6 w-32 h-10 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-6" />

        <div className="space-y-4">
          {/* Seasons Title Skeleton */}
          <div className="w-48 h-6 bg-gray-200 animate-pulse rounded" />

          {/* Accordion Skeleton */}
          <div className="space-y-4">
            {/* Season Item 1 */}
            <div className="border rounded-md px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="w-20 h-6 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>

            {/* Season Item 2 */}
            <div className="border rounded-md px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-28 h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="w-14 h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="w-24 h-6 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
              </div>
              {/* Expanded Episode Skeleton */}
              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-[180px] h-[100px] bg-gray-200 animate-pulse rounded-md" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded" />
                      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                    </div>
                    <div className="w-20 h-4 bg-gray-200 animate-pulse rounded mt-2" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-[180px] h-[100px] bg-gray-200 animate-pulse rounded-md" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="w-2/3 h-5 bg-gray-200 animate-pulse rounded" />
                      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                    </div>
                    <div className="w-16 h-4 bg-gray-200 animate-pulse rounded mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default SeriesDetailsSkeleton;
