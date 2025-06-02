"use client";
import { AddSeriesToWatchlist } from "@/app/(root)/shows/actions";
import { Button } from "@/components/ui/button";
import { removeSeriesFromWatchlist } from "@/lib/actions/seriesActions";
import { cn } from "@/lib/utils";
import { Loader, Text } from "lucide-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface SeriesData {
  id: string;
  title: string;
  poster: string;
}

const AddToWatchListBtn = ({
  seriesData,
  session,
  isTracked,
}: // session,
{
  seriesData: SeriesData;
  session: Session | null;
  isTracked: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState<boolean | null>(isTracked);
  const router = useRouter();

  const handleAddToWatchlist = async () => {
    if (!session?.user?.id) {
      router.push("/sign-in");
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isAdded === false) {
        const result = await AddSeriesToWatchlist({
          seriesData: {
            title: seriesData.title,
            id: seriesData.id.toString(),
            poster: seriesData.poster,
          },
        });

        if (result?.success) {
          toast.success("Series added to watchlist", {
            description: `${seriesData.title} added to watchlist`,
          });
          setIsAdded(true);
        } else {
          toast.error("Failed to add to watchlist", {
            description: result?.message || "Unknown error",
          });
        }
      } else {
        const result = await removeSeriesFromWatchlist(
          seriesData.id.toString()
        );

        if (result?.success) {
          toast.success("Series removed from watchlist", {
            description: `${seriesData.title} removed from watchlist`,
          });
          setIsAdded(false);
        } else {
          toast.error("Failed to remove from watchlist", {
            description: result?.message || "Unknown error",
          });
        }
      }
    } catch (error) {
      console.error("Watchlist operation failed:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={cn(
        "text-white p-2 hover:bg-[#6c3384] duration-200 rounded-none m-0 h-full bg-transparent",
        isAdded && "bg-[#6c3384]"
      )}
      onClick={handleAddToWatchlist}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader className="animate-spin" />
      ) : (
        <Text strokeWidth={4} />
      )}
    </Button>
  );
};

export default AddToWatchListBtn;
