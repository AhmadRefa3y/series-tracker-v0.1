import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import UpNext from "./_components/UpNext";
import History from "./_components/History";
import UpcomingEpisodes from "./_components/UpcomingEpisodes";
import Trending from "./_components/Trending";
import StatsSidebar from "./_components/StatsSidebar";
import WelcomeBanner from "./_components/WelcomeBanner";
import DashboardSectionNav from "./_components/DashboardSectionNav";
import {
  CarouselSkeleton,
  CalendarSkeleton,
  UpNextSkeleton,
} from "./_components/UpNextSkeleton";

export const metadata = {
  title: "Dashboard - Sennit",
};

/** Anchors the sticky tab rail can scroll to; empty rows are hidden client-side. */
const SECTIONS = [
  { id: "continue-watching", label: "Continue Watching" },
  { id: "history", label: "History" },
  { id: "calendar", label: "Calendar" },
  { id: "trending", label: "Trending" },
];

const DashBoard = async () => {
  const session = await auth();
  if (!session) {
    return redirect("/sign-in?callbackUrl=/dashboard");
  }

  return (
    <div className="relative flex w-full flex-col text-white">
      <WelcomeBanner />

      {/* Sticky segmented tab rail for app-like section switching. */}
      <DashboardSectionNav sections={SECTIONS} />

      {/* Main content + stats rail */}
      <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-12 lg:px-6">
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

      {/* Full-bleed trending row */}
      <div className="border-y border-white/[0.05] bg-white/[0.015]">
        <div className="container mx-auto w-full">
          <Suspense fallback={<CarouselSkeleton title="Trending Now" />}>
            <Trending />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
