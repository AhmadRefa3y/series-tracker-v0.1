import { Progress } from "@/components/ui/progress";
import { Loader, RefreshCcw, StepForward } from "lucide-react";

const SectionHeader = ({
  title,
  loading,
}: {
  title: string;
  loading: boolean;
}) => (
  <div className="flex gap-1 text-xl items-center mt-4 px-4 sm:px-0">
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
        {[...Array(6)].map((_, idx) => (
          <div className="px-1 w-1/6 min-w-[180px]" key={idx}>
            <div className="flex flex-col bg-black h-[350px] text-white overflow-hidden group relative hover:perspective-distant duration-200">
              <div className="flex flex-col relative flex-1 h-[310px] overflow-hidden">
                <div className="relative h-full flex flex-col">
                  <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                  <div className="w-full h-full animate-pulse bg-gray-900/40" />
                </div>
              </div>
              <Progress value={0} className="w-full mt-auto rounded-none" />
              <div className="flex items-center bg-[#2d2d2d] border-r border-[#414040] h-[40px]">
                <button className="h-full w-full p-2 flex items-center justify-center opacity-50 cursor-not-allowed">
                  <Loader className="animate-spin" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { UpNextSkeleton, SectionHeader };
