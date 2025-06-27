import React, { Suspense } from "react";
import UpNext from "./_components/UpNext";
import RecentlyWatched from "./_components/RecentlyWatched";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WelcomeBanner from "@/app/(root)/(private)/dashboard/_components/WelcomeBanner";
import { UpNextSkeleton } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";

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
