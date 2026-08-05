import { Medal } from "lucide-react";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { Reveal } from "@/components/ui/reveal";
import { LightPool, Stage } from "@/components/ui/stage";
import { siteConfig } from "@/lib/site-config";

export function Titles() {
  return (
    <Stage className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5">
        <Reveal>
          <p className="eyebrow">Championship Titles</p>
          <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
            Three IBJJF titles in two years
          </h2>
        </Reveal>

        {/* Three subjects posed side by side under their own lights — the
            staging from the reference, with medals instead of jackets. */}
        <div className="mt-20 grid gap-10 md:grid-cols-3 md:gap-6">
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
                className="pointer-events-none absolute inset-x-8 -top-10 bottom-24 -z-10 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(248,113,113,0.28) 0%, rgba(220,38,38,0.10) 50%, transparent 100%)",
                  filter: "blur(26px)",
                }}
              />

              <PhotoSlot
                ratio="portrait"
                label={`Photo — ${title.title}${title.year ? ` (${title.year})` : ""}`}
                className="bg-card/60 backdrop-blur-[1px]"
              />

              <LightPool className="-mt-2" />

              <div className="-mt-6 text-center">
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
                <h3 className="mt-3 font-display text-lg font-semibold uppercase leading-snug tracking-wide">
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
