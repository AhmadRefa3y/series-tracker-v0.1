import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BarChart3 } from "lucide-react";

import {
  getUserInsights,
  type UserInsights,
} from "@/app/(root)/(private)/dashboard/insightsData";
import ProgressRing from "./ProgressRing";
import WeeklyBars from "./WeeklyBars";

const SidebarSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
    <div className="h-56 animate-pulse rounded-xl bg-white/[0.04]" />
  </div>
);

const StatTile = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
    <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">
      {label}
    </div>
    <div className="mt-1 text-xl font-black leading-none text-white">
      {value}
    </div>
    {hint && <div className="mt-1 text-[10px] text-white/35">{hint}</div>}
  </div>
);

const StatsSidebarContent = ({ insights }: { insights: UserInsights }) => {
  const hours = Math.round(insights.totalTimeMinutes / 60);
  const completionPct =
    insights.totalSeries > 0
      ? Math.round((insights.completedSeries / insights.totalSeries) * 100)
      : 0;
  const recentPct =
    insights.totalEpisodes > 0
      ? Math.round((insights.last7DaysEpisodes / insights.totalEpisodes) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress rings — Trakt-style completion stats */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <BarChart3 className="size-3.5 text-primaryColor" strokeWidth={2.5} />
          Your progress
        </h3>
        <div className="mt-4 flex items-center justify-around">
          <ProgressRing
            percent={completionPct}
            label="Finished"
            sub={`${insights.completedSeries}/${insights.totalSeries} shows`}
          />
          <ProgressRing
            percent={recentPct}
            label="This week"
            sub={`${insights.last7DaysEpisodes} eps`}
          />
        </div>
      </div>

      {/* Weekly histogram */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
        <WeeklyBars data={insights.weeklyActivity} />
      </div>

      {/* Quick numbers */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Watch time" value={`${hours}h`} hint="All time" />
        <StatTile
          label="Episodes"
          value={insights.totalEpisodes}
          hint="Marked watched"
        />
        <StatTile label="Shows" value={insights.totalSeries} hint="Started" />
        <StatTile
          label="Genres"
          value={insights.genreStats.length}
          hint={
            insights.genreStats[0]
              ? `Top: ${insights.genreStats[0].name}`
              : "—"
          }
        />
      </div>

      {/* CTA to full insights page */}
      <Link
        href="/insights"
        className="group flex items-center justify-between rounded-xl border border-primaryColor/20 bg-primaryColor/[0.06] px-4 py-3 transition-colors duration-300 hover:border-primaryColor/50 hover:bg-primaryColor/10"
      >
        <span className="text-[13px] font-bold text-primaryColor">
          Full stats &amp; taste profile
        </span>
        <ArrowRight className="size-4 shrink-0 text-primaryColor transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
};

/** Trakt-style stats rail rendered from the same data as /insights. */
const StatsSidebar = () => (
  <aside aria-label="Your stats" className="w-full lg:w-80 lg:shrink-0">
    <Suspense fallback={<SidebarSkeleton />}>
      <StatsSidebarSuspensed />
    </Suspense>
  </aside>
);

async function StatsSidebarSuspensed() {
  const insights = await getUserInsights();

  if (!insights) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 text-center text-sm text-white/40">
        Stats will appear once you start tracking shows.
      </div>
    );
  }

  return <StatsSidebarContent insights={insights} />;
}

export default StatsSidebar;
