import { Progress } from "@/components/ui/progress";
import { RefreshCcw, StepForward } from "lucide-react";

const SectionHeader = ({
  title,
  loading,
}: {
  title: string;
  loading: boolean;
}) => (
  <div className="flex gap-1 text-xl items-center mt-4">
    <StepForward width={40} height={40} />
    {title}
    {loading && <RefreshCcw className="animate-spin ms-2" size={30} />}
  </div>
);

const UpNextSkeleton = () => {
  return (
    <div className="flex flex-col text-white">
      <div className="flex justify-between items-center">
        <SectionHeader title="Up next" loading={true} />
      </div>
      <div className="flex flex-wrap items-center justify-center mt-3 w-full gap-y-2 py-4">
        {[...Array(4)].map((_, idx) => (
          <div className="px-2 w-1/4 min-w-[320px] animate-pulse" key={idx}>
            <div className="flex flex-col bg-black rounded-sm h-[280px] text-white overflow-hidden gap-1 relative">
              <div className="flex gap-2 relative flex-1">
                {/* Poster Image */}
                <div className="relative min-w-[160px] h-full flex flex-col bg-white/30 animate-pulse ">
                  {/* Next Episode Button */}
                  <button>{/* Loader or Check icon */}</button>
                </div>

                <div className="flex flex-col items-start py-2 w-full pr-2">
                  {/* Title */}
                  <div></div>

                  {/* Completion Status or Episode Info */}
                  <div>{/* Completed badge or current episode info */}</div>

                  {/* Progress Bar */}
                  <Progress value={0} className="w-full mt-auto rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { UpNextSkeleton, SectionHeader };
