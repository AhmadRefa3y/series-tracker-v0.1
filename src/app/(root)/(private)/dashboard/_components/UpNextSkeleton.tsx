import { CalendarDays, ChevronRight, CirclePlay, RefreshCcw } from "lucide-react";

const SectionHeader = ({
  title,
  loading,
  icon,
}: {
  title: string;
  loading: boolean;
  /** Overrides the default play icon (e.g. a calendar for the Calendar row). */
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 text-white">
    {icon ?? <CirclePlay className="size-6 shrink-0" strokeWidth={2} />}
    <span className="text-[22px] font-bold leading-none">{title}</span>
    <ChevronRight className="size-5 shrink-0 text-white/70" />
    {loading && <RefreshCcw className="ml-1 size-5 animate-spin text-white/40" />}
  </div>
);

const CardSkeleton = () => (
  <div className="w-[272px] shrink-0 sm:w-[300px]">
    <div className="relative aspect-video overflow-hidden rounded-lg bg-[#17141a]">
      <div className="absolute inset-0 animate-pulse bg-white/[0.06]" />
      <div className="absolute inset-x-1.5 bottom-1.5 h-7 animate-pulse rounded-md bg-black/60" />
    </div>
    <div className="mt-2.5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/5 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" />
      </div>
      <div className="size-5 animate-pulse rounded bg-white/[0.05]" />
    </div>
  </div>
);

/** Same shape as a carousel section, used as its Suspense fallback. */
const CarouselSkeleton = ({ title }: { title: string }) => {
  return (
    <section className="mx-4 py-6 md:mx-6">
      <div className="flex items-center justify-between px-4 md:px-6">
        <SectionHeader title={title} loading />
      </div>
      <div className="mt-4 flex gap-4 overflow-hidden px-4 pb-2 md:px-6">
        {[...Array(5)].map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
    </section>
  );
};

const UpNextSkeleton = () => <CarouselSkeleton title="Continue Watching" />;

/** Calendar section placeholder with the same carousel shape. */
const CalendarSkeleton = () => (
  <section className="mx-4 py-6 pt-8 md:mx-6 md:pt-10">
    <div className="px-4 md:px-6">
      <SectionHeader
        title="Calendar"
        loading
        icon={<CalendarDays className="size-6 shrink-0" strokeWidth={2} />}
      />
    </div>
    <div className="mt-4 flex gap-4 overflow-hidden px-4 pb-2 md:px-6">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="w-[272px] shrink-0 sm:w-[300px]">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-[#17141a]">
            <div className="absolute inset-0 animate-pulse bg-white/[0.06]" />
            <div className="absolute left-1.5 top-1.5 h-5 w-16 animate-pulse rounded-md bg-black/60" />
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="h-4 w-3/5 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export { UpNextSkeleton, CarouselSkeleton, CalendarSkeleton, SectionHeader };
