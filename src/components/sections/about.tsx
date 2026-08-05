import { PhotoSlot } from "@/components/ui/photo-slot";
import { coach, coachesWho } from "@/lib/site-config";

export function About() {
  return (
    <section id="about" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          <div className="md:sticky md:top-16">
            <PhotoSlot
              label="Portrait — Lily in her gi, studio or gym"
              aspect="aspect-[3/4]"
              className="max-w-sm"
            />
          </div>

          <div>
            <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-primary">
              Meet your coach
            </p>
            <h2 className="text-balance font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
              {coach.years} years on the mat
            </h2>

            <div className="mt-6 space-y-4 text-pretty leading-relaxed text-muted-foreground">
              {coach.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <h3 className="mt-10 font-display text-lg uppercase tracking-wide">
              Who I coach
            </h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {coachesWho.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <p className="font-display text-base uppercase tracking-wide text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
