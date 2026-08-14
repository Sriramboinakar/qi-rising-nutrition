"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.main
      className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 pt-20 sm:px-6 sm:py-8 lg:pt-8"
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}