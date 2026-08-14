"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Server-component-friendly staggered entrance: takes the children of a server
 * page and fades each direct child in one after the other.
 */
export function StaggerChildren({
  children,
  stagger = 0.06,
  delay = 0.05,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: delay + i * stagger }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}