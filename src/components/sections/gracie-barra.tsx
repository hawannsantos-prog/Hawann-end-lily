import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { siteConfig } from "@/lib/site-config";

const stats = [
  { value: <CountUp value={1000} suffix="+" />, label: "Schools Worldwide" },
  { value: "Euro · Worlds · Pan Am", label: "Champion Titles" },
  { value: "1986", label: "Founded by Carlos Gracie Jr." },
];

export function GracieBarra() {
  return (
    <Section className="py-24 md:py-36">
      <Container>
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="eyebrow">Proudly Team {siteConfig.coach.team}</p>
            <h2 className="mt-6 text-balance font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight md:text-6xl">
              Training under the largest Jiu-Jitsu team in the world
            </h2>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
              Founded in 1986 by Master Carlos Gracie Jr., Gracie Barra now
              spans over 1,000 schools worldwide — a lineage of structure and
              discipline I bring into every private lesson.
            </p>
          </Reveal>

          <Reveal direction="right" delay={0.12}>
            <dl className="divide-y divide-border border-y border-border">
              {stats.map((stat) => (
                <div key={stat.label} className="py-8">
                  <dt className="eyebrow">{stat.label}</dt>
                  <dd className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
