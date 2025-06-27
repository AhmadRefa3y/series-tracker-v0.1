import { useState, useTransition } from "react";
import { addSeriesToWatchedHistory } from "@/lib/actions/sharedActions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Check, RefreshCcw } from "lucide-react";

type SeriesData = {
  id: string;
  title: string;
  poster: string;
  Finished: boolean;
  number_of_episodes: number;
  watchedEpisodes: number;
};

const AddToHistoryBtn = ({ seriesData }: { seriesData: SeriesData }) => {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState<boolean>(seriesData.watchedEpisodes > 0);
  const router = useRouter();

  const handleAddToHistory = () => {
    startTransition(async () => {
      const res = await addSeriesToWatchedHistory(
        seriesData.id,
        seriesData.title,
        seriesData.poster
      );
      setAdded(res.success);
      if (res.success) {
        router.refresh();
      }
    });
  };

  return (
    <button
      className={cn(
        "w-full relative group border flex items-center border-[#9f42c6] text-[#9f42c6]  duration-200 p-3 uppercase cursor-pointer hover:bg-[#9f42c6] hover:text-white animate-in fade-in-0 slide-in-from-left-80",
        added && "bg-[#9f42c6] text-white"
      )}
      onClick={handleAddToHistory}
      disabled={isPending || added}
    >
      {isPending && (
        <div className="flex items-center justify-center w-full absolute inset-0  bg-black/60 text-white">
          <RefreshCcw className="animate-spin" size={30} />
        </div>
      )}
      {added ? (
        <div className="flex items-center ">
          <Check strokeWidth={1} size={30} />
          <div className="ml-2 flex flex-col items-start">
            <span className="font-semibold">
              {(
                (seriesData.watchedEpisodes / seriesData.number_of_episodes) *
                100
              ).toFixed(0)}{" "}
              % watched
            </span>
            <div className="text-sm  normal-case ">
              {seriesData.watchedEpisodes}/{seriesData.number_of_episodes} eps
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <Check strokeWidth={1} size={30} />
          <span className="ml-2 font-semibold">Add to history</span>
        </div>
      )}
    </button>
  );
};

export default AddToHistoryBtn;
