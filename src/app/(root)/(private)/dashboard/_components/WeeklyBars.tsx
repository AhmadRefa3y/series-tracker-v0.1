"use client";

import { motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";

/**
 * Tiny bar chart of the last 7 days of watching activity, oldest first.
 * Bars scale against the busiest day; quiet days get a minimum stub.
 */
const WeeklyBars = ({ data }: { data: number[] }) => {
  const reduceMotion = useReducedMotion();
  const peak = Math.max(1, ...data);

  // Weekday labels for the 7-day window ending today, e.g. [M, T, W, T, F, S, S]
  const labels: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    labels.push(format(day, "EEEEE"));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          Last 7 days
        </h3>
        <span className="text-[11px] font-semibold text-white/60">
          {data.reduce((a, b) => a + b, 0)} episodes
        </span>
      </div>
      <div className="flex h-20 items-end gap-2">
        {data.map((count, index) => (
          <div
            key={index}
            className="group flex flex-1 flex-col items-center gap-1.5"
            title={`${count} episode${count === 1 ? "" : "s"}`}
          >
            <span
              className={`text-[10px] font-bold transition-opacity duration-200 ${
                count > 0
                  ? "text-primaryColor opacity-0 group-hover:opacity-100"
                  : "opacity-0"
              }`}
            >
              {count > 0 ? count : ""}
            </span>
            <motion.div
              className={`w-full rounded-t-sm ${
                count > 0
                  ? "bg-gradient-to-t from-primaryColor/40 to-primaryColor"
                  : "bg-white/[0.06]"
              }`}
              initial={{ height: 0 }}
              animate={{
                height: `${Math.max((count / peak) * 100, count > 0 ? 12 : 5)}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 26,
                delay: reduceMotion ? 0 : 0.25 + index * 0.05,
              }}
            />
            <span className="text-[9px] font-semibold uppercase text-white/35">
              {labels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyBars;
