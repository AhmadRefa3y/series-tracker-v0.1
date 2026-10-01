import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BarChart3,
  Clock,
  Film,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  getUserInsights,
  type UserInsights,
} from "@/app/(root)/(private)/dashboard/insightsData";
import ProgressRing from "./ProgressRing";
import WeeklyBars from "./WeeklyBars";

const SidebarSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="h-44 animate-pulse rounded-3xl bg-white/[0.04]" />
    <div className="h-48 animate-pulse rounded-3xl bg-white/[0.04]" />
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="h-[68px] animate-pulse rounded-2xl bg-white/[0.04]"
        />
      ))}
    </div>
  </div>
);

const StatTile = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 transition-colors duration-300 hover:border-primaryColor/30 hover:bg-white/[0.05]">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
      <Icon className="size-3 text-primaryColor" strokeWidth={2.5} />
      {label}
    </div>
    <div className="mt-1.5 text-xl font-black leading-none tracking-tight text-white">
      {value}
    </div>
    {hint ? (
      <div className="mt-1 truncate text-[10px] text-white/35">{hint}</div>
    ) : null}
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
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-inset backdrop-blur-xl">
        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          <BarChart3 className="size-3.5 text-primaryColor" strokeWidth={2.5} />
          Your progress
        </h3>
        <div className="mt-5 flex items-center justify-around">
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
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-inset backdrop-blur-xl">
        <WeeklyBars data={insights.weeklyActivity} />
      </div>

      {/* Quick numbers */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Watch time"
          value={`${hours}h`}
          hint="All time"
          icon={Clock}
        />
        <StatTile
          label="Episodes"
          value={insights.totalEpisodes}
          hint="Marked watched"
          icon={Film}
        />
        <StatTile
          label="Shows"
          value={insights.totalSeries}
          hint="Started"
          icon={Layers}
        />
        <StatTile
          label="Genres"
          value={insights.genreStats.length}
          hint={
            insights.genreStats[0]
              ? `Top: ${insights.genreStats[0].name}`
              : "—"
          }
          icon={Sparkles}
        />
      </div>

      {/* CTA to full insights page */}
      <Link
        href="/insights"
        className="group flex items-center justify-between gap-3 rounded-2xl border border-primaryColor/25 bg-primaryColor/[0.07] px-4 py-3.5 transition-all duration-300 hover:border-primaryColor/50 hover:bg-primaryColor/[0.12]"
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
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 text-center text-sm text-white/40">
        Stats will appear once you start tracking shows.
      </div>
    );
  }

  return <StatsSidebarContent insights={insights} />;
}

export default StatsSidebar;
