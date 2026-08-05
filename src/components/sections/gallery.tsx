"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Medal } from "lucide-react";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { siteConfig } from "@/lib/site-config";

const Medal3D = dynamic(
  () => import("@/components/ui/medal-3d").then((m) => m.Medal3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Medal className="size-20 text-primary/30" strokeWidth={1} aria-hidden />
      </div>
    ),
  },
);

const frames = siteConfig.gallery;
/** Photo frames plus one final frame for the medal. */
const total = frames.length + 1;

/**
 * A pinned sequence: the section is several screens tall, its contents stick to
 * the viewport, and scrolling cross-fades from one frame to the next — photos
 * first, then the medal.
 *
 * Driven by scroll *position* rather than by timers, so the sequence is fully
 * scrubbable: scroll back up and it runs in reverse, stop halfway and it holds.
 */
export function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  // Reduced motion: no pinning, no scrubbing — just show the frames stacked.
  if (reduced) {
    return (
      <section className="surface-dark bg-background py-24 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 md:grid-cols-3">
          {frames.map((frame) => (
            <figure key={frame.caption}>
              <GalleryImage frame={frame} />
              <figcaption className="mt-4">
                <p className="eyebrow">{frame.kicker}</p>
                <p className="mt-2 text-lg">{frame.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={track}
      className="surface-dark stage-grade relative bg-background text-foreground"
      // One viewport of scroll per frame, plus one to read the last.
      style={{ height: `${(total + 1) * 100}vh` }}
      aria-label="Training gallery"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Stage lighting, matching the rest of the dark sections. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.09) 0%, transparent 70%), radial-gradient(50% 60% at 0% 50%, rgba(220,38,38,0.25) 0%, transparent 72%), radial-gradient(50% 60% at 100% 50%, rgba(220,38,38,0.18) 0%, transparent 72%)",
          }}
        />

        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-5">
          <div className="relative aspect-[4/5] w-full max-w-md sm:aspect-[16/10] sm:max-w-3xl">
            {frames.map((frame, index) => (
              <Frame key={frame.caption} progress={scrollYProgress} index={index}>
                <GalleryImage frame={frame} fill />
              </Frame>
            ))}

            {/* Final frame: the medal, front and centre. */}
            <Frame progress={scrollYProgress} index={frames.length}>
              <div className="flex h-full w-full items-center justify-center">
                <div className="aspect-square h-full max-h-full">
                  <Medal3D tone="#d4af37" />
                </div>
              </div>
            </Frame>
          </div>

          {/* Captions swap in step with the frames. */}
          <div className="relative mt-10 h-24 w-full max-w-2xl text-center">
            {[
              ...frames.map((f) => ({ kicker: f.kicker, caption: f.caption })),
              { kicker: "The Result", caption: "Three IBJJF championship titles" },
            ].map((copy, index) => (
              <Frame
                key={copy.caption}
                progress={scrollYProgress}
                index={index}
                sharp
              >
                <p className="eyebrow">{copy.kicker}</p>
                <p className="mt-3 text-balance font-display text-2xl font-bold uppercase leading-tight tracking-tight md:text-4xl">
                  {copy.caption}
                </p>
              </Frame>
            ))}
          </div>

          <Progress progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

/**
 * One frame in the sequence. Owns only its slice of the scroll range: fully
 * visible in the middle of its slice, faded out at both edges.
 */
function Frame({
  progress,
  index,
  sharp = false,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  /**
   * Swap rather than crossfade. Two photos dissolving through each other reads
   * as a transition; two headlines doing it reads as a rendering fault, so text
   * frames fade out inside their own slice before the next one begins.
   */
  sharp?: boolean;
  children: React.ReactNode;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  // Half the crossfade window. Kept well under half a slice so only two frames
  // are ever on screen at once — wider than that and three captions stack up.
  const w = (sharp ? 0.08 : 0.2) / total;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Sharp frames keep their whole fade inside their own slice; soft frames
  // spill past both edges so neighbours overlap.
  const inEdge = sharp ? start : start - w;
  const outEdge = sharp ? end : end + w;

  /**
   * Visibility as an explicit function of scroll rather than an interpolated
   * stop list. Two reasons: the stop arrays needed clamping at the first and
   * last frames, where they ran outside [0, 1] and produced a keyframe list the
   * Web Animations API rejects outright — which throws during hydration and
   * blanks the page, not just the animation. And a clamped list silently
   * misinterpolated, leaving frame one fading back in at the end of the run.
   * This ramps up, holds, ramps down, and is zero everywhere else. Full stop.
   */
  const visibility = (v: number): number => {
    if (isFirst && v <= start + w) return 1;
    if (isLast && v >= end - w) return 1;
    if (v <= inEdge || v >= outEdge) return 0;
    if (v < start + w) return (v - inEdge) / (start + w - inEdge);
    if (v <= end - w) return 1;
    return (outEdge - v) / (outEdge - (end - w));
  };

  const opacity = useTransform(progress, visibility);
  // Settling inward as it arrives reads as depth rather than a flat dissolve.
  const scale = useTransform(progress, (v) => {
    const t = visibility(v);
    const arriving = v < (start + end) / 2;
    return 1 + (1 - t) * (arriving ? 0.06 : -0.03);
  });

  return (
    <motion.div
      style={{ opacity, scale }}
      // flex-col: caption frames hold a kicker above a headline, and the
      // default row direction would sit them side by side.
      className="absolute inset-0 flex flex-col items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

function Progress({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div
      aria-hidden
      className="absolute bottom-10 left-1/2 h-px w-40 -translate-x-1/2 bg-foreground/15"
    >
      <motion.div style={{ width }} className="h-full bg-primary" />
    </div>
  );
}

function GalleryImage({
  frame,
  fill = false,
}: {
  frame: (typeof frames)[number];
  fill?: boolean;
}) {
  if (!frame.src) {
    return (
      <PhotoSlot
        ratio={fill ? "fill" : "landscape"}
        label={frame.alt}
        className={fill ? "rounded-2xl" : undefined}
      />
    );
  }

  return (
    <div className={fill ? "relative h-full w-full" : "relative aspect-[16/10]"}>
      <Image
        src={frame.src}
        alt={frame.alt}
        fill
        sizes="(max-width: 640px) 100vw, 768px"
        className="rounded-2xl object-cover"
      />
    </div>
  );
}
