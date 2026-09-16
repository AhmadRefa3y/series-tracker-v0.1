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
    <div className="bg-[#17141a]">
      <div className="container mx-auto relative">
        <section className="mx-4 py-6 pt-8 md:mx-6 md:pt-10">
          <div className="px-4 md:px-6">
            <SectionHeader
              title="Trending Now"
              loading={false}
              icon={<Flame className="size-6 shrink-0" strokeWidth={2} />}
            />
          </div>
          <TrendingRow items={shows.results} />
        </section>
      </div>
    </div>
  );
};

export default Trending;
