"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Soft app-like ease, typed as a cubic-bezier tuple for framer-motion. */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Route-level template: Next.js re-mounts this on every navigation inside
 * `(root)`, which lets each page animate in with a short, native-feeling
 * fade + lift. Kept to transform/opacity only so it never shifts layout.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex w-full flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
