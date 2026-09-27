import Link from "next/link";

import { getWatchHistory } from "@/app/(root)/(private)/dashboard/DashbaordData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import CarouselShell from "./CarouselShell";
import HistoryCard from "./HistoryCard";
import {
  format,
  isSameDay,
  isToday,
  isYesterday,
} from "date-fns";

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
    <section className="py-6">
      <div className="px-4 md:px-6">
        <SectionHeader title="History" loading={false} href="/history" />
      </div>

      <div className="mt-4 space-y-5 px-4 md:px-6">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Day divider — Trakt history style (CarouselShell adds mt-4) */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-white/[0.07]" />
              <span className="text-[10px] font-semibold text-white/30">
                {group.items.length} episode{group.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <CarouselShell contentKey={group.items.length}>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="w-[272px] shrink-0 snap-start sm:w-[300px]"
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
