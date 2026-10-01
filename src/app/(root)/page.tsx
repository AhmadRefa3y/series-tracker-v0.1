import Hero from "@/app/(root)/_components/Hero";
import TrendingShows, {
  TopShowsSkeleton,
} from "@/app/(root)/_components/TrendingShows";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

export const metadata = {
  title: "Home - Sennit",
  description: "Discover the latest and trending shows on Sennit.",
};

const HomePage = async () => {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex w-full flex-col items-center text-white">
      <Hero />

      <div className="w-full">
        <div className="container mx-auto px-4 py-16 sm:py-20 md:px-6">
          <Suspense fallback={<TopShowsSkeleton />}>
            <TrendingShows />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
