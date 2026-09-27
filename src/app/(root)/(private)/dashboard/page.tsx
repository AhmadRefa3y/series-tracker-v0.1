import React, { Suspense } from "react";
import UpNext from "./_components/UpNext";
import History from "./_components/History";
import UpcomingEpisodes from "./_components/UpcomingEpisodes";
import Trending from "./_components/Trending";
import StatsSidebar from "./_components/StatsSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WelcomeBanner from "@/app/(root)/(private)/dashboard/_components/WelcomeBanner";
import {
  CarouselSkeleton,
  CalendarSkeleton,
  UpNextSkeleton,
} from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";

export const metadata = {
  title: "Dashboard - Sennit",
};

const DashBoard = async () => {
  const session = await auth();
  if (!session) {
    return redirect("/sign-in?callbackUrl=/dashboard");
  }

  return (
    <div className="flex flex-col text-white">
      <WelcomeBanner />

      {/* Main content + Trakt-style stats rail */}
      <div className="container mx-auto flex flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-10 lg:px-6">
        <div className="min-w-0 flex-1">
          <Suspense fallback={<UpNextSkeleton />}>
            <UpNext />
          </Suspense>

          <Suspense fallback={<CarouselSkeleton title="History" />}>
            <History />
          </Suspense>

          <Suspense fallback={<CalendarSkeleton />}>
            <UpcomingEpisodes />
          </Suspense>
        </div>

        <StatsSidebar />
      </div>

      {/* Full-bleed trending row, Simkl-discovery style */}
      <div className="bg-[#1d1922]/60">
        <div className="container mx-auto px-4 lg:px-6">
          <Suspense fallback={<CarouselSkeleton title="Trending Now" />}>
            <Trending />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
