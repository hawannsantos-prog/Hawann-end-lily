import { PhotoSlot } from "@/components/ui/photo-slot";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function Audiences() {
  return (
    <Section id="lessons" tone="grey" className="py-24 md:py-36">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Who I Coach</p>
            <h2 className="mt-6 max-w-2xl text-balance font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight md:text-7xl">
              Every lesson is built around one student
            </h2>
          </div>
          <a
            href="#book"
            className={buttonVariants({ variant: "pill", size: "pill" })}
          >
            Book a lesson
          </a>
        </Reveal>

        {/* Category cards: image carries the card, label sits underneath. */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {siteConfig.audiences.map((audience, index) => (
            <Reveal key={audience.key} as="article" delay={index * 0.1}>
              <PhotoSlot
                ratio="landscape"
                label={`Photo — ${audience.name} training with Lily`}
                className="bg-background"
              />
              <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight">
                {audience.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {audience.blurb}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
