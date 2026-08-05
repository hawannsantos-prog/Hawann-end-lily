/**
 * Entry point for the standalone preview bundle.
 *
 * Mounts the same section components the Next.js site uses into a plain DOM
 * node, so the whole page can be shipped as one self-contained HTML file for
 * review. The deployed site does NOT use this file.
 */
import { createRoot } from "react-dom/client";

import { Audiences } from "@/components/sections/audiences";
import { Booking } from "@/components/sections/booking";
import { Coach } from "@/components/sections/coach";
import { GracieBarra } from "@/components/sections/gracie-barra";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { Titles } from "@/components/sections/titles";

function App() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Coach />
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

const host = document.getElementById("root");
if (host) createRoot(host).render(<App />);
