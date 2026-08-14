"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Re-mounts on every route change. Provides an instant, subtle fade-up so
 * navigation feels smooth without ever blocking the page swap.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}