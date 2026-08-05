import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Titles } from "@/components/sections/titles";
import { Rates } from "@/components/sections/rates";
import { BookingCalendar } from "@/components/sections/booking-calendar";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Titles />
      <Rates />
      <BookingCalendar />
      <Footer />
    </main>
  );
}
