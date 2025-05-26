import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const DashBoard = () => {
  return (
    <div className="flex flex-col text-white px-5 bg-gray-900">
      <WelcomeBanner />
      <div className="container"></div>
    </div>
  );
};

export default DashBoard;

const WelcomeBanner = () => {
  return (
    <div className="flex flex-col container mx-auto">
      <div className="flex py-10 justify-between">
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
        <div className="flex  flex-wrap capitalize items-center justify-end  flex-1 w-fit text-nowrap gap-8 font-semibold ">
          <div className="flex flex-col gap-4  items-end">
            <Link href="/" className="min-w-[1/2] flex">
              2025 Year To Date
              <ChevronRight />
            </Link>
            <Link
              href="/"
              className="flex 
            "
            >
              apr month in review <ChevronRight />
            </Link>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <Link href="/" className="min-w-[1/2] flex">
              All time stats
              <ChevronRight />
            </Link>
            <Link href="/" className=" flex">
              your profile <ChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
