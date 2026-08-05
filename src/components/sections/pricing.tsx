import { Check } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { siteConfig } from "@/lib/site-config";

const { pricing } = siteConfig;

type Tier = {
  price: string;
  unit: string;
  name: string;
  description: string;
  featured: boolean;
};

/**
 * Only tiers with a real price are shown. `packageRate` and
 * `partnerSurchargePercent` are null in site-config until they're set, so the
 * page shows one clean price instead of a placeholder.
 */
const tiers: Tier[] = [
  {
    price: `${pricing.currencySymbol}${pricing.single}`,
    unit: "per lesson",
    name: "Private Lesson",
    description: `One ${pricing.sessionMinutes}-minute private session, one-on-one — for competitors and beginners alike.`,
    featured: true,
  },
  ...(pricing.packageRate !== null
    ? [
        {
          price: `${pricing.currencySymbol}${pricing.packageRate}`,
          unit: "each",
          name: `${pricing.packageMinimum}+ Lesson Package`,
          description: `Book ${pricing.packageMinimum} or more sessions and the rate drops for every lesson.`,
          featured: false,
        },
      ]
    : []),
  ...(pricing.partnerSurchargePercent !== null
    ? [
        {
          price: `+${pricing.partnerSurchargePercent}%`,
          unit: "split it",
          name: "Bring a Partner",
          description:
            "Train with someone else for a surcharge — split between you, it works out cheaper each.",
          featured: false,
        },
      ]
    : []),
];

const included = [
  `${pricing.sessionMinutes}-minute session`,
  // Only promise partner training while that tier is actually priced.
  pricing.partnerSurchargePercent !== null
    ? "One-on-one, or with a partner"
    : "One-on-one",
  "Built around your goals",
  "Cancel or reschedule yourself",
];

export function Pricing() {
  const single = tiers.length === 1;

  return (
    <Section id="pricing" tone="grey" className="py-24 md:py-36">
      <Container>
        <Reveal>
          <p className="eyebrow">Rates</p>
          <h2 className="mt-6 max-w-2xl text-balance font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight md:text-7xl">
            One hour. One student. One price.
          </h2>
        </Reveal>

        <div
          className={
            single
              ? "mt-16 grid gap-6"
              : "mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {tiers.map((tier, index) => (
            <Reveal
              key={tier.name}
              as="article"
              delay={index * 0.1}
              className={
                single
                  ? "flex flex-col items-start gap-8 rounded-2xl bg-background p-10 md:flex-row md:items-center md:justify-between md:p-14"
                  : "rounded-2xl bg-background p-10"
              }
            >
              <div>
                <p className="eyebrow">{tier.name}</p>
                <p className="mt-4 flex items-baseline gap-3">
                  <span
                    className={
                      single
                        ? "font-display text-7xl font-bold leading-none tracking-tight text-foreground md:text-9xl"
                        : "font-display text-5xl font-bold leading-none tracking-tight text-foreground"
                    }
                  >
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tier.unit}
                  </span>
                </p>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              {single ? (
                <a
                  href="#book"
                  className={buttonVariants({
                    variant: "pill",
                    size: "pill",
                    className: "shrink-0",
                  })}
                >
                  Book a lesson
                </a>
              ) : null}
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Check
                  className="size-4 shrink-0 text-primary"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
