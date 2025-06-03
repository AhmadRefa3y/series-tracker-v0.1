import { ChevronRight, RefreshCcw, StepForward } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import UpNext from "./_components/UpNext";
import RecentlyWatched from "./_components/RecentlyWatched";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const DashBoard = async () => {
  const session = await auth();
  if (!session) {
    return redirect("/");
  }
  return (
    <div className="flex flex-col text-white">
      <WelcomeBanner />
      <div className="bg-[#1d1d1d]">
        <div className="container mx-auto relative min-h-[380px]">
          <Suspense fallback={<UpNextSkeleton />}>
            <UpNext />
          </Suspense>
        </div>
      </div>
      <div className="bg-[#111111]">
        <div className="container mx-auto relative h-full">
          <RecentlyWatched />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;

const WelcomeBanner = () => {
  return (
    <div className="flex flex-col w-full mx-auto bg-gray-900  p-4">
      <div className="flex py-10 justify-between container mx-auto">
        <div className="flex  gap-4 flex-1">
          <div>
            <Image
              src="https://i2.wp.com/walter-r2.trakt.tv/hotlink-ok/placeholders/medium/fry.png?ssl=1"
              alt="User profile"
              width={70}
              height={70}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col font-semibold">
            <p className="text-2xl">Hello, Ahmed</p>
            <p>Member since Mar 12, 2019 1:24 AM</p>
          </div>
        </div>
        <div className="flex  flex-wrap uppercase text-sm items-center justify-end  flex-1 w-fit text-nowrap gap-8 font-semibold ">
          <div className="flex flex-col gap-4  items-end">
            <Link
              href="/"
              className="  hover:bg-[#9f42c6] duration-200 rounded-lg pl-2 flex w-fit justify-between "
            >
              2025 Year To Date
              <ChevronRight />
            </Link>
            <Link
              href="/"
              className="  hover:bg-[#9f42c6] duration-200 rounded-lg pl-2 flex w-fit justify-between "
            >
              apr month in review <ChevronRight />
            </Link>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <Link
              href="/"
              className="  hover:bg-[#9f42c6] duration-200 rounded-lg pl-2 flex w-fit justify-between "
            >
              All time stats
              <ChevronRight />
            </Link>
            <Link
              href="/"
              className="  hover:bg-[#9f42c6] duration-200 rounded-lg pl-2 flex w-fit justify-between "
            >
              your profile
              <ChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex gap-1 text-xl items-center mt-4">
    <StepForward width={40} height={40} />
    {title}
    {<RefreshCcw className="animate-spin ms-2" size={30} />}
  </div>
);
const UpNextSkeleton = () => {
  return (
    <div className="flex flex-col text-white">
      <div className="flex justify-between items-center">
        <SectionHeader title="Up next" />
      </div>
      <div className="flex flex-wrap items-center justify-center mt-3 w-full gap-y-2 py-4">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-[#232323] rounded-lg p-4 mx-2 w-40 animate-pulse"
          >
            <div className="w-24 h-36 bg-gray-700 rounded mb-3" />
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-1/2 mb-1" />
            <div className="h-3 bg-gray-700 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
};
