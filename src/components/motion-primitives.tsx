"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function fadeUp(): Variants {
  return {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: EASE },
    },
  };
}

export function staggerContainer(stagger = 0.06, delayChildren = 0.05): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "tr";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.06,
  delay = 0.05,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial={reduced ? false : "hidden"}
      animate="visible"
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "tr";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp className={className} variants={fadeUp()} initial={reduced ? false : "hidden"}>
      {children}
    </Comp>
  );
}