import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CirclePlay,
  RefreshCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Section header for dashboard rows: an icon badge, an editorial title, and an
 * optional "View all" affordance on the right. When `href` is set the title
 * itself becomes the link, so callers never nest anchors.
 */
const SectionHeader = ({
  title,
  loading,
  icon,
  href,
  subtitle,
  eyebrow,
  actionLabel = "View all",
}: {
  title: string;
  loading: boolean;
  /** Overrides the default play icon (e.g. a calendar for the Calendar row). */
  icon?: React.ReactNode;
  /** When set, the title links here and a "View all" pill appears. */
  href?: string;
  subtitle?: string;
  eyebrow?: string;
  actionLabel?: string;
}) => {
  const iconNode = icon ?? (
    <CirclePlay className="size-5" strokeWidth={2.25} />
  );

  const titleNode = (
    <h2 className="text-lg font-bold leading-none tracking-tight text-white transition-colors duration-200 group-hover/section:text-primaryColor sm:text-xl">
      {title}
    </h2>
  );

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-primaryColor shadow-inset">
          {iconNode}
        </span>

        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primaryColor/80">
              {eyebrow}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            {href ? (
              <Link href={href} className="group/section flex items-center">
                {titleNode}
              </Link>
            ) : (
              titleNode
            )}
            {loading ? (
              <RefreshCcw className="size-3.5 animate-spin text-white/35" />
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 truncate text-[13px] text-white/45">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {href ? (
        <Link
          href={href}
          className="group/see flex shrink-0 items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] font-semibold text-white/60 transition-all duration-300 hover:border-primaryColor/40 hover:bg-primaryColor/10 hover:text-primaryColor"
        >
          <span className="hidden sm:inline">{actionLabel}</span>
          <ChevronRight className="size-3.5 transition-transform duration-300 group-hover/see:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
};

const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("shrink-0", className)}>
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.05] bg-ink-600">
      <div className="absolute inset-0 animate-pulse bg-white/[0.05]" />
      <div className="absolute inset-x-2 bottom-2 h-7 animate-pulse rounded-lg bg-black/50" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-4 w-3/5 animate-pulse rounded bg-white/[0.07]" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
    </div>
  </div>
);

/** Same shape as a carousel section, used as its Suspense fallback. */
const CarouselSkeleton = ({ title }: { title: string }) => (
  <section className="py-8">
    <div className="px-4 md:px-6">
      <SectionHeader title={title} loading />
    </div>
    <div className="mt-5 flex gap-4 overflow-hidden px-4 pb-2 md:px-6">
      {[...Array(5)].map((_, idx) => (
        <CardSkeleton key={idx} className="w-[280px] sm:w-[320px]" />
      ))}
    </div>
  </section>
);

const UpNextSkeleton = () => <CarouselSkeleton title="Continue Watching" />;

/** Calendar section placeholder with the same carousel shape. */
const CalendarSkeleton = () => (
  <section className="py-8">
    <div className="px-4 md:px-6">
      <SectionHeader
        title="Calendar"
        loading
        icon={
          <CalendarDays className="size-5" strokeWidth={2.25} />
        }
      />
    </div>
    <div className="mt-5 flex gap-4 overflow-hidden px-4 pb-2 md:px-6">
      {[...Array(5)].map((_, idx) => (
        <CardSkeleton key={idx} className="w-[280px] sm:w-[320px]" />
      ))}
    </div>
  </section>
);

export { UpNextSkeleton, CarouselSkeleton, CalendarSkeleton, SectionHeader };
