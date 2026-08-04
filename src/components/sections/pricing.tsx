import { Check } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const { pricing } = siteConfig;

const tiers = [
  {
    price: `${pricing.currencySymbol}${pricing.single}`,
    unit: "per lesson",
    name: "Single Lesson",
    description: `One ${pricing.sessionMinutes}-minute private session, one-on-one.`,
    featured: false,
  },
  {
    price: `${pricing.currencySymbol}${pricing.packageRate}`,
    unit: "each",
    name: `${pricing.packageMinimum}+ Lesson Package`,
    description: `Book ${pricing.packageMinimum} or more sessions and the rate drops for every lesson.`,
    featured: true,
  },
  {
    price: `+${pricing.partnerSurchargePercent}%`,
    unit: "split it",
    name: "Bring a Partner",
    description:
      "Train with someone else for a 20% surcharge — split between you, it works out cheaper each.",
    featured: false,
  },
];

const included = [
  `${pricing.sessionMinutes}-minute session`,
  "One-on-one, or with a partner",
  "Built around your goals",
  "Cancel or reschedule yourself",
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5">
        <p className="eyebrow">Rates</p>
        <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
          Simple, per-session pricing
        </h2>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={
                tier.featured
                  ? "relative rounded-xl border border-primary/60 bg-card p-8"
                  : "relative rounded-xl border border-border bg-card p-8"
              }
            >
              {tier.featured ? (
                <span className="absolute right-6 top-6 rounded-full bg-primary/15 px-3 py-1 font-display text-[0.65rem] uppercase tracking-[0.18em] text-primary">
                  Best value
                </span>
              ) : null}
              <p className="eyebrow">{tier.name}</p>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.unit}
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {tier.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-8 rounded-xl border border-border bg-card/40 p-8 md:flex-row md:items-center">
          <ul className="grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Check
                  className="size-4 shrink-0 text-primary"
                  strokeWidth={2}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
          <a href="#book" className={buttonVariants({ size: "lg" })}>
            See available times
          </a>
        </div>
      </div>
    </section>
  );
}
