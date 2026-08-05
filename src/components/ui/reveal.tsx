"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 36 },
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Fades and lifts its children into place the first time they scroll into view.
 *
 * Honours prefers-reduced-motion by rendering the final state immediately —
 * the content still appears, it just doesn't travel.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Stagger siblings by passing 0, 0.08, 0.16… */
  delay?: number;
  direction?: Direction;
  as?: "div" | "section" | "article" | "li";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];
  const from = offsets[direction];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={cn(className)}
      initial={{ opacity: 0, x: from.x, y: from.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        // Cinematic ease-out: fast start, long settle.
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Component>
  );
}
