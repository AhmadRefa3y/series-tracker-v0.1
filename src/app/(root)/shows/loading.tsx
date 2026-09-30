export default function Loading() {
  return (
    <div className="flex-1 bg-[#17141a]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-[#221d29]" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#221d29]" />
        </div>

        <div className="flex items-start gap-6">
          <aside className="hidden w-[300px] shrink-0 lg:block">
            <div className="h-[520px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#1c1820]" />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 h-8 w-48 animate-pulse rounded-lg bg-[#221d29]" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="flex flex-col">
                  <div className="aspect-[2/3] w-full animate-pulse rounded-xl border border-white/[0.06] bg-[#221d29]" />
                  <div className="mt-3 h-3.5 w-3/4 animate-pulse rounded bg-[#221d29]" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#221d29]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
