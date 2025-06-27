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
    <div className="relative flex flex-col items-center justify-center bg-black text-white  h-full ">
      <Hero />
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <Suspense fallback={<TopShowsSkeleton />}>
          <TrendingShows />
        </Suspense>
      </div>
    </div>
  );
};

export default HomePage;
