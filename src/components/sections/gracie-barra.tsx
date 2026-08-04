import { siteConfig } from "@/lib/site-config";

const stats = [
  { value: "1,000+", label: "Schools Worldwide" },
  { value: "Euro · Worlds · Pan Am", label: "Champion Titles" },
  { value: "1986", label: "Founded by Carlos Gracie Jr." },
];

export function GracieBarra() {
  return (
    <section className="border-t border-border/60 bg-card/40 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <p className="eyebrow">Proudly Team {siteConfig.coach.team}</p>
            <h2 className="mt-5 text-balance font-display text-3xl font-semibold uppercase leading-tight tracking-tight md:text-4xl">
              Training and competing under the largest Jiu-Jitsu team in the
              world
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Founded in 1986 by Master Carlos Gracie Jr., Gracie Barra now spans
              over 1,000 schools worldwide — a lineage of structure and
              discipline I bring into every private lesson.
            </p>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-background px-7 py-8">
                <dt className="eyebrow">{stat.label}</dt>
                <dd className="mt-2 font-display text-2xl font-semibold uppercase tracking-tight text-foreground md:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
