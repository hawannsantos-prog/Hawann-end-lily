import { Audiences } from "@/components/sections/audiences";
import { Booking } from "@/components/sections/booking";
import { Coach } from "@/components/sections/coach";
import { Gallery } from "@/components/sections/gallery";
import { GracieBarra } from "@/components/sections/gracie-barra";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { Titles } from "@/components/sections/titles";

/**
 * The whole page, in order.
 *
 * Kept as its own component so the Next.js route and the standalone preview
 * bundle render the same thing — adding a section here reaches both, instead of
 * one composition silently falling behind the other.
 */
export function Site() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Coach />
        <Gallery />
        <Audiences />
        <Titles />
        <GracieBarra />
        <Pricing />
        <Booking />
      </main>
      <SiteFooter />
    </>
  );
}
