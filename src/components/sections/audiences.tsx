import { Heart, Sprout, Trophy } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/site-config";

const icons = {
  competitors: Trophy,
  beginners: Sprout,
  hobbyists: Heart,
} as const;

export function Audiences() {
  return (
    <section id="lessons" className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5">
        <Reveal>
          <p className="eyebrow">Who I Coach</p>
          <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
            Every lesson is built around one student
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {siteConfig.audiences.map((audience, index) => {
            const Icon = icons[audience.key as keyof typeof icons];
            return (
              <Reveal
                key={audience.key}
                as="article"
                delay={index * 0.1}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-colors duration-200 hover:border-zinc-700"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <Icon
                  className="size-6 text-primary"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-6 font-display text-xl font-semibold uppercase tracking-wide">
                  {audience.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {audience.blurb}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
