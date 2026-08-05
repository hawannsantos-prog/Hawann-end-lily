"use client";

import dynamic from "next/dynamic";
import { Medal } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { LightPool, Stage } from "@/components/ui/stage";
import { siteConfig } from "@/lib/site-config";

/**
 * Three.js is ~600 KB — far too much to sit in the critical path for a page
 * whose job is to get someone to book a lesson. Loading it on the client only,
 * after first paint, keeps the rest of the site fast; the fallback holds the
 * exact same footprint so nothing shifts when it arrives.
 */
const Medal3D = dynamic(
  () => import("@/components/ui/medal-3d").then((m) => m.Medal3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Medal
          className="size-16 text-primary/30"
          strokeWidth={1}
          aria-hidden
        />
      </div>
    ),
  },
);

/** Gold, silver, bronze — read left to right in the order the titles are listed. */
const tones = ["#d4af37", "#cfd4d8", "#b87333"];

export function Titles() {
  return (
    <Stage className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5">
        <Reveal>
          <p className="eyebrow">Championship Titles</p>
          <h2 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl">
            Three IBJJF titles in two years
          </h2>
        </Reveal>

        {/* Three subjects posed side by side under their own lights — the
            staging from the reference, with medals instead of jackets. */}
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-6">
          {siteConfig.titles.map((title, index) => (
            <Reveal
              key={title.title}
              as="article"
              delay={index * 0.12}
              className="group relative"
            >
              {/* Vertical beam behind the subject. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 -top-6 bottom-24 -z-10 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(248,113,113,0.28) 0%, rgba(220,38,38,0.10) 50%, transparent 100%)",
                  filter: "blur(26px)",
                }}
              />

              <div className="aspect-square w-full">
                <Medal3D tone={tones[index % tones.length]} />
              </div>

              <LightPool className="-mt-6" />

              <div className="-mt-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Medal
                    className="size-4 text-primary"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {title.federation} · {title.note}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold uppercase leading-snug tracking-wide">
                  {title.title}
                </h3>
                {title.year ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {title.year}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Stage>
  );
}
