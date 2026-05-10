import React, { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserInsights from "../dashboard/_components/UserInsights";
import { getUserInsights } from "../dashboard/insightsData";
import { BarChart2 } from "lucide-react";

export const metadata = {
  title: "Insights - Sennit",
};

const InsightsSection = async () => {
  const insights = await getUserInsights();
  if (!insights) return (
    <div className="text-center py-20 text-gray-500">
        No watching history found. Start tracking shows to see your insights!
    </div>
  );
  return <UserInsights insights={insights} />;
};

const InsightsPage = async () => {
  const session = await auth();
  if (!session) {
    return redirect("/sign-in?callbackUrl=/insights");
  }

  return (
    <div className="min-h-screen bg-[#111111] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-10">
            <h1 className="text-4xl font-black text-white flex items-center gap-3">
                <BarChart2 className="text-orange-500" size={32} />
                Your Cinema Insights
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Detailed breakdown of your watching habits and statistics.</p>
        </div>

        <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 h-32 bg-[#1a1a1a] animate-pulse rounded-2xl" />
                <div className="h-32 bg-[#1a1a1a] animate-pulse rounded-2xl" />
                <div className="h-32 bg-[#1a1a1a] animate-pulse rounded-2xl" />
                <div className="h-32 bg-[#1a1a1a] animate-pulse rounded-2xl" />
                <div className="md:col-span-4 h-96 bg-[#1a1a1a] animate-pulse rounded-3xl" />
            </div>
        }>
          <InsightsSection />
        </Suspense>
      </div>
    </div>
  );
};

export default InsightsPage;
