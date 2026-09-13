import { Suspense } from "react";
import Link from "next/link";
import { History as HistoryIcon } from "lucide-react";

import { getWatchHistory } from "@/app/(root)/(private)/dashboard/DashbaordData";
import HistoryCard from "@/app/(root)/(private)/dashboard/_components/HistoryCard";
import Pagination from "@/app/(root)/shows/components/Pagination";
import { getCurrentUser } from "@/lib/actions/userActions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "History - Sennit",
};

const PER_PAGE = 24;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await getCurrentUser("/history");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { success, data, total, message } = await getWatchHistory({
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PER_PAGE));

  return (
    <div className="min-h-screen w-full bg-[#17141a] px-4 py-10 text-white md:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <HistoryIcon
              className="size-6 text-primaryColor"
              strokeWidth={2.25}
            />
            <h1 className="text-3xl font-black uppercase tracking-widest sm:text-4xl">
              Watch History
            </h1>
          </div>
          <p className="text-sm text-white/50">
            {total === 1 ? "1 episode watched" : `${total ?? 0} episodes watched`}
          </p>
        </div>

        {!success ? (
          <div className="flex h-[40vh] items-center justify-center px-4 text-white/50">
            <p className="text-lg font-semibold">
              {message ?? "Something went wrong"}
            </p>
          </div>
        ) : !data?.length ? (
          <div className="flex h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <HistoryIcon className="size-10 text-white/20" />
            <div>
              <h2 className="text-xl font-bold">Nothing here yet</h2>
              <p className="mt-1 text-sm text-white/50">
                Episodes you mark as watched will show up here.
              </p>
            </div>
            <Link
              href="/shows"
              className="rounded-lg bg-primaryColor px-5 py-2 text-sm font-semibold text-secondaryColor transition-transform duration-200 hover:scale-[1.03]"
            >
              Browse shows
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ))}
            </div>

            <Suspense fallback={null}>
              <Pagination currentPageProp={page} totalPagesProp={totalPages} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
