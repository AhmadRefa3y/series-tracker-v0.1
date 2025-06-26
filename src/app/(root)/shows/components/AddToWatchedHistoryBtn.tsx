"use client";
import { Check, Loader, History } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addSeriesToWatchedHistory } from "@/lib/actions/sharedActions";

interface SeriesData {
  id: string;
  title: string;
}

const AddToWatchedHistoryBtn = ({
  seriesData,
  isWatched,
  session,
}: {
  seriesData: SeriesData;
  isWatched: boolean;
  session: { user?: { id?: string } } | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState<boolean>(isWatched);
  const router = useRouter();

  const handleAddToHistory = async () => {
    if (!session?.user?.id) {
      router.push("/sign-in");
      return;
    }
    if (isLoading || added) return;
    setIsLoading(true);

    try {
      const result = await addSeriesToWatchedHistory(
        seriesData.id,
        seriesData.title
      );
      if (result.success) {
        toast.success("Series marked as watched", {
          description: `${seriesData.title} added to watched history`,
        });
        setAdded(true);
      } else {
        toast.error("Failed to add to watched history", {
          description: result.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Add to watched history failed:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`text-white p-2 hover:bg-[#0082ce] duration-200 rounded-full ${
        added ? "bg-[#0082ce]" : ""
      }`}
      onClick={handleAddToHistory}
      disabled={isLoading || added}
      title={added ? "Already in history" : "Add to watched history"}
    >
      {isLoading ? (
        <Loader className="animate-spin" />
      ) : added ? (
        <Check strokeWidth={4} />
      ) : (
        <History strokeWidth={4} />
      )}
    </button>
  );
};

export default AddToWatchedHistoryBtn;
