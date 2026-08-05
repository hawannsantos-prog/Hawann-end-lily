"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * A hero container that tilts a framed visual as it scrolls into view,
 * giving the top of the page a sense of depth. Respects reduced motion via
 * the global CSS rule that neutralises transitions/animations.
 */
export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.35], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.9, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.35], [40, 0]);

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <div className="w-full">{titleComponent}</div>
      <motion.div
        style={{ rotateX: rotate, scale, translateY, perspective: 1000 }}
        className="mt-8 w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
