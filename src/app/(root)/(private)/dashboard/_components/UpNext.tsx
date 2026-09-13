import { redirect } from "next/navigation";
import Link from "next/link";
import { Tv } from "lucide-react";

import { auth } from "@/auth";
import { getUpNextSeries } from "@/app/(root)/(private)/dashboard/DashbaordData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import UpNextCarousel from "@/app/(root)/(private)/dashboard/_components/UpNextCarousel";

const UpNext = async () => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const { success, data, message } = await getUpNextSeries(8);

  if (!success) {
    return (
      <div className="flex items-center justify-center px-4 py-14 text-white/60">
        <p className="text-lg font-semibold">{message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-14 text-center text-white">
        <Tv className="size-10 text-white/30" />
        <div>
          <h2 className="text-xl font-bold">You&apos;re all caught up</h2>
          <p className="mt-1 max-w-md text-sm text-white/50">
            Start watching a show and your next episodes will appear here.
          </p>
        </div>
        <Link
          href="/shows"
          className="rounded-lg bg-primaryColor px-5 py-2 text-sm font-semibold text-secondaryColor transition-transform duration-200 hover:scale-[1.03]"
        >
          Browse shows
        </Link>
      </div>
    );
  }

  return (
    <section className="py-6 pt-8 md:pt-10">
      <div className="px-4 md:px-6">
        <Link
          href="/watchlist"
          className="inline-flex transition-opacity duration-200 hover:opacity-80"
        >
          <SectionHeader title="Continue Watching" loading={false} />
        </Link>
      </div>
      <UpNextCarousel items={data} />
    </section>
  );
};

export default UpNext;
