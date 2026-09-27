"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Tv } from "lucide-react";

/** Animated empty state for the Continue Watching row. */
const EmptyUpNext = () => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="flex flex-col items-center justify-center gap-4 px-4 py-14 text-center text-white"
    >
      <motion.span
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }
        }
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Tv className="size-10 text-white/30" />
      </motion.span>
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
    </motion.div>
  );
};

export default EmptyUpNext;
