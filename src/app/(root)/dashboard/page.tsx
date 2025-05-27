import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import UpNext from "./_components/UpNext";
import RecentlyWatched from "./_components/RecentlyWatched";

const DashBoard = () => {
  return (
    <div className="flex flex-col text-white">
      <WelcomeBanner />
      <div className="bg-[#1d1d1d]">
        <div className="container mx-auto relative min-h-[380px]">
          <UpNext />
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
