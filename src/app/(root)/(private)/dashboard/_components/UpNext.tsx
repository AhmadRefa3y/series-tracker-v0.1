import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { getUpNextSeries } from "@/app/(root)/(private)/dashboard/DashbaordData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import UpNextCarousel from "@/app/(root)/(private)/dashboard/_components/UpNextCarousel";
import EmptyUpNext from "@/app/(root)/(private)/dashboard/_components/EmptyUpNext";

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
    return <EmptyUpNext />;
  }

  return (
    <section className="py-6">
      <div className="px-4 md:px-6">
        <Link
          href="/watchlist"
          className="inline-flex transition-opacity duration-200 hover:opacity-80"
        >
          <SectionHeader title="Continue Watching" loading={false} href="/watchlist" />
        </Link>
      </div>
      <UpNextCarousel items={data} />
    </section>
  );
};

export default UpNext;
