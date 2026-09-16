"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import type { TrendingSeriesT } from "@/types";
import CarouselShell from "@/app/(root)/(private)/dashboard/_components/CarouselShell";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

/**
 * Poster card for a trending series. Same footprint and spring entrance as
 * the other dashboard carousels; the whole poster links to the series page.
 */
const TrendingCard = ({
  show,
  index,
}: {
  show: TrendingSeriesT;
  index: number;
}) => {
  const year = show.first_air_date?.split("-")[0] || "";
  const href = `/shows/${show.name.replace(/\s+/g, "_").toLowerCase()}-${show.id}`;

  return (
    <motion.article
      className="w-[152px] shrink-0 snap-start sm:w-[168px]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 24,
        delay: Math.min(index * 0.05, 0.5),
      }}
    >
      <Link href={href} className="group block" aria-label={show.name}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#17141a] ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-primaryColor/50">
          <Image
            src={
              show.poster_path
                ? `${POSTER_BASE}${show.poster_path}`
                : "/no-image-available.webp"
            }
            alt={show.name}
            fill
            sizes="168px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Rating chip */}
          <span className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Star className="size-3 fill-primaryColor text-primaryColor" />
            {show.vote_average.toFixed(1)}
          </span>

          {/* Bottom gradient with title, revealed more strongly on hover */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2.5 pb-2 pt-8">
            <h3 className="truncate text-[13px] font-bold text-white">
              {show.name}
            </h3>
            {year && <p className="text-[11px] text-white/60">{year}</p>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

/** Horizontal row of trending series. */
const TrendingRow = ({ items }: { items: TrendingSeriesT[] }) => (
  <CarouselShell contentKey={items.length}>
    {items.map((show, index) => (
      <TrendingCard key={show.id} show={show} index={index} />
    ))}
  </CarouselShell>
);

export default TrendingRow;
