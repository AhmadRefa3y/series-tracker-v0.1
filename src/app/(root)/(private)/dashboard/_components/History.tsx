import {
  format,
  isSameDay,
  isToday,
  isYesterday,
} from "date-fns";

import { getWatchHistory } from "@/app/(root)/(private)/dashboard/DashbaordData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import CarouselShell from "./CarouselShell";
import HistoryCard from "./HistoryCard";

const HISTORY_LIMIT = 14;

/** Trakt-style day label for the dividers between watch sessions. */
const dayLabel = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMM");
};

const History = async () => {
  const { success, data } = await getWatchHistory({ limit: HISTORY_LIMIT });

  if (!success || !data?.length) {
    return null;
  }

  // Group entries by calendar day so each watch session gets a divider header,
  // like Trakt's history feed.
  const groups: { label: string; items: typeof data }[] = [];
  for (const item of data) {
    const watchedDay = new Date(item.watchedAt);
    const current = groups[groups.length - 1];
    if (current && isSameDay(new Date(current.items[0].watchedAt), watchedDay)) {
      current.items.push(item);
    } else {
      groups.push({ label: dayLabel(watchedDay), items: [item] });
    }
  }

  return (
    <section id="history" className="scroll-mt-32 py-8">
      <div className="px-4 md:px-6">
        <SectionHeader
          title="History"
          loading={false}
          href="/history"
          actionLabel="Full history"
          subtitle="Everything you've watched, newest first"
        />
      </div>

      <div className="mt-6 space-y-7 px-4 md:px-6">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-semibold text-white/40">
                {group.items.length} episode{group.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <CarouselShell contentKey={group.items.length}>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="w-[280px] shrink-0 snap-start sm:w-[320px]"
                >
                  <HistoryCard item={item} />
                </div>
              ))}
            </CarouselShell>
          </div>
        ))}
      </div>
    </section>
  );
};

export default History;
