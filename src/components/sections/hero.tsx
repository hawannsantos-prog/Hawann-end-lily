import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { PhotoSlot } from "@/components/ui/photo-slot";

export function Hero() {
  return (
    // The scroll card is pinned inside a fixed 80rem track and lands well above
    // its own bottom edge; the negative margin reclaims that dead space.
    <section id="top" className="-mb-24 flex flex-col overflow-hidden md:-mb-44">
      <ContainerScroll
        titleComponent={
          // pb clears the card's -mt-12 overlap so the last line stays visible.
          <div className="px-4 pb-16">
            <p className="eyebrow">Private Lessons</p>
            <h1 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground md:text-[7rem]">
              Coach Lily
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
              Three-time IBJJF champion. Sixty minutes, one-on-one, built around
              what you&rsquo;re actually working toward.
            </p>
            <p className="mt-10 font-display text-sm font-medium uppercase tracking-[0.3em] text-primary">
              Private Lesson Booking
            </p>
          </div>
        }
      >
        <PhotoSlot
          ratio="fill"
          label="Hero photo — Lily competing or coaching on the mats. Landscape, at least 1400×720."
          className="rounded-xl border-0"
        />
      </ContainerScroll>
    </section>
  );
}
