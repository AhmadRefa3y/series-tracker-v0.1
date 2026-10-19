"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clapperboard } from "lucide-react";

/** Calm, native-style empty state for the Continue Watching row. */
const EmptyUpNext = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="py-8"
    >
      <div className="mx-4 flex flex-col items-start gap-4 rounded-none border border-white/[0.06] bg-white/[0.02] p-5 sm:flex-row sm:items-center md:mx-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-primaryColor">
          <Clapperboard className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-white">
            You&apos;re all caught up
          </h2>
          <p className="mt-0.5 text-[13px] leading-snug text-white/45">
            Start watching a show and the next episode will appear here.
          </p>
        </div>

        <Link
          href="/shows"
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white/80 transition-colors duration-200 hover:bg-primaryColor hover:text-secondaryColor"
        >
          Browse shows
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.section>
  );
};

export default EmptyUpNext;
