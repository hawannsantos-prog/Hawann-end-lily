import { Trophy } from "lucide-react";
import { titles } from "@/lib/site-config";

export function Titles() {
  return (
    <section id="titles" className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-primary">
            Track record
          </p>
          <h2 className="text-balance font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
            Championship titles
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            A decade of competing at the highest level of the sport — the same
            experience I bring to every private lesson.
          </p>
        </div>

        <ol className="mt-12 divide-y divide-border border-y border-border">
          {titles.map((title) => (
            <li
              key={`${title.year}-${title.event}`}
              className="grid grid-cols-[auto_1fr] items-center gap-4 py-5 md:grid-cols-[6rem_1fr_auto] md:gap-6"
            >
              <span className="font-display text-2xl font-bold tabular-nums text-primary md:text-3xl">
                {title.year}
              </span>
              <div>
                <p className="font-display text-lg uppercase tracking-wide">
                  {title.event}
                </p>
                <p className="text-sm text-muted-foreground">{title.result}</p>
              </div>
              <span className="col-span-2 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1 font-display text-xs uppercase tracking-widest text-muted-foreground md:col-span-1">
                <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
                {title.belt} belt
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
