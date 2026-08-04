import { Medal } from "lucide-react";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { siteConfig } from "@/lib/site-config";

export function Titles() {
  return (
    <section className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5">
        <p className="eyebrow">Championship Titles</p>
        <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
          Three IBJJF titles in two years
        </h2>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {siteConfig.titles.map((title) => (
            <article
              key={title.title}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <PhotoSlot
                ratio="landscape"
                label={`Photo — ${title.title}${title.year ? ` (${title.year})` : ""}`}
                className="rounded-none border-0 border-b border-border"
              />
              <div className="p-6">
                <div className="flex items-center gap-2">
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
