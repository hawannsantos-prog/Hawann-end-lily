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

export default function Home() {
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
