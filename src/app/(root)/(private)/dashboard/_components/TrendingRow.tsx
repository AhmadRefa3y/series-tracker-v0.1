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
      className="group/rank flex w-[158px] shrink-0 snap-start items-end sm:w-[176px]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 24,
        delay: Math.min(index * 0.05, 0.5),
      }}
    >
      {/* Oversized rank number, Trakt trending style */}
      <span
        aria-hidden
        className="-mr-3 select-none text-[56px] font-black italic leading-[0.8] text-transparent sm:text-[64px]"
        style={{
          WebkitTextStroke: "1.5px rgba(252,211,77,0.5)",
        }}
      >
        {index + 1}
      </span>

      <Link href={href} className="group block w-[120px] shrink-0 sm:w-[132px]" aria-label={show.name}>
        <div className="card-lift relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-600 shadow-lift group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-hover:border-primaryColor/50 group-hover:shadow-gold">
          <Image
            src={
              show.poster_path
                ? `${POSTER_BASE}${show.poster_path}`
                : "/no-image-available.webp"
            }
            alt={show.name}
            fill
            sizes="132px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Rating chip */}
          <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
            <Star className="size-3 fill-primaryColor text-primaryColor" />
            {show.vote_average.toFixed(1)}
          </span>

          {/* Bottom gradient with title, revealed more strongly on hover */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink-950/95 via-ink-950/45 to-transparent px-3 pb-2.5 pt-10">
            <h3 className="truncate text-[13px] font-semibold tracking-tight text-white">
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
