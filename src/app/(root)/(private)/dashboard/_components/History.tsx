import Link from "next/link";

import { getWatchHistory } from "@/app/(root)/(private)/dashboard/DashbaordData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import CarouselShell from "./CarouselShell";
import HistoryCard from "./HistoryCard";

const HISTORY_LIMIT = 12;

const History = async () => {
  const { success, data } = await getWatchHistory({ limit: HISTORY_LIMIT });

  if (!success || !data?.length) {
    return null;
  }

  return (
    <section className="mx-4 py-6 pt-8 md:mx-6 md:pt-10">
      <div className="px-4 md:px-6">
        <Link
          href="/history"
          className="inline-flex transition-opacity duration-200 hover:opacity-80"
        >
          <SectionHeader title="History" loading={false} />
        </Link>
      </div>
      <CarouselShell contentKey={data.length}>
        {data.map((item) => (
          <div
            key={item.id}
            className="w-[272px] shrink-0 snap-start sm:w-[300px]"
          >
            <HistoryCard item={item} />
          </div>
        ))}
      </CarouselShell>
    </section>
  );
};

export default History;
