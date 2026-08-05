import { PhotoSlot } from "@/components/ui/photo-slot";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";

export function Coach() {
  return (
    <Section id="coach" className="py-24 md:py-36">
      <Container>
        <Reveal>
          <p className="eyebrow">Meet Your Coach</p>
          {/* Sportswear-scale headline: very large, very tight, all caps. */}
          <h2 className="mt-6 max-w-4xl text-balance font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight md:text-7xl">
            Competing at the highest level — and coaching the same way
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-[1fr_440px] md:gap-20">
          <Reveal
            delay={0.1}
            className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            <p>
              I&rsquo;m Lily, a competitor for{" "}
              <span className="font-medium text-foreground">Gracie Barra</span>{" "}
              and a three-time IBJJF champion — European Champion, No-Gi World
              Champion, and No-Gi Pan American Champion. I only started
              Jiu-Jitsu two years ago; everything I&rsquo;ve won came in that
              short a time, because I fell in love with what the sport demands —
              discipline, focus, determination.
            </p>

            <blockquote className="border-l-2 border-primary py-2 pl-6 text-xl font-medium text-foreground md:text-2xl">
              &ldquo;Discipline and consistency built my titles. Loving the sport
              is what&rsquo;s kept me showing up for them.&rdquo;
            </blockquote>

            <p>
              On the mats, I represent the school first — whether you&rsquo;re
              chasing competition goals, a healthy hobby, or steady progress one
              class at a time. For my younger students especially, I focus on
              what they&rsquo;re individually striving for, and do everything I
              can to get them there.
            </p>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <PhotoSlot
              ratio="portrait"
              label="Portrait of Lily — in the gi, or on the podium. Portrait crop, at least 900×1200."
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
