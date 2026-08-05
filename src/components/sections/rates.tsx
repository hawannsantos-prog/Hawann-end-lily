import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rates, sessionLengthMinutes } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Rates() {
  return (
    <section id="rates" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-primary">
            Rates
          </p>
          <h2 className="text-balance font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Every session is {sessionLengthMinutes} minutes, one-on-one. Packs
            never expire — train on your schedule.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {rates.map((rate) => (
            <div
              key={rate.label}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                rate.highlight
                  ? "border-primary bg-card shadow-lg shadow-primary/10"
                  : "border-border bg-card",
              )}
            >
              {rate.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 font-display text-xs uppercase tracking-widest text-primary-foreground">
                  Most popular
                </span>
              )}
              <p className="font-display text-lg uppercase tracking-wide text-muted-foreground">
                {rate.label}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold tracking-tight">
                  {rate.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {rate.unit}
                </span>
              </div>
              {rate.note && (
                <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  {rate.note}
                </p>
              )}
              <div className="mt-auto pt-6">
                <a href="#booking">
                  <Button
                    className="w-full"
                    variant={rate.highlight ? "primary" : "outline"}
                  >
                    Book now
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
