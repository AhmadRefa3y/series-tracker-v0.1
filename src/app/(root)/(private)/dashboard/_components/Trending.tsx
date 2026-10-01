import { Flame } from "lucide-react";

import { getTrendingSeries } from "@/app/(root)/shows/showsData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import TrendingRow from "./TrendingRow";

const Trending = async () => {
  // Not user-seeded, so no auth needed beyond the private layout guard.
  const shows = await getTrendingSeries(false, 1);

  if (!shows || shows.results.length === 0) {
    return null;
  }

  return (
    <section id="trending" className="scroll-mt-32 py-8">
      <div className="px-4 md:px-6">
        <SectionHeader
          title="Trending Now"
          loading={false}
          subtitle="The shows everyone is talking about this week"
          icon={<Flame className="size-5" strokeWidth={2.25} />}
        />
      </div>
      <TrendingRow items={shows.results} />
    </section>
  );
};

export default Trending;
