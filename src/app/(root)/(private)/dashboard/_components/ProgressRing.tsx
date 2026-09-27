"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Circular progress ring, Trakt-profile style. Pure SVG + framer-motion so it
 * animates in without any chart dependency.
 */
const ProgressRing = ({
  percent,
  label,
  sub,
}: {
  percent: number;
  label: string;
  sub: string;
}) => {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, percent));

  // SVG circle progress math: circumference of r=34 circle.
  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-24">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="7"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#fcd34d"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 20,
              delay: reduceMotion ? 0 : 0.2,
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">
          {clamped}%
        </span>
      </div>
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-wide text-white/70">
          {label}
        </div>
        <div className="text-[10px] text-white/35">{sub}</div>
      </div>
    </div>
  );
};

export default ProgressRing;
