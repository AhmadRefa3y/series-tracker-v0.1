"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Tv } from "lucide-react";

/** Animated empty state for the Continue Watching row. */
const EmptyUpNext = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="mx-4 my-8 flex flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] px-6 py-16 text-center md:mx-6"
    >
      <motion.span
        animate={{ scale: [1, 1.06, 1], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inset"
      >
        <Tv className="size-7 text-primaryColor" />
      </motion.span>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          You&apos;re all caught up
        </h2>
        <p className="mt-2 max-w-md text-sm text-white/50">
          Start watching a show and your next episodes will appear here.
        </p>
      </div>

      <Link
        href="/shows"
        className="group inline-flex items-center gap-2 rounded-full bg-primaryColor px-6 py-2.5 text-sm font-bold text-secondaryColor shadow-gold transition-transform duration-200 hover:scale-[1.03]"
      >
        Browse shows
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
};

export default EmptyUpNext;
