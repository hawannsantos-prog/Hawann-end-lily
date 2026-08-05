"use client";

import { motion } from "framer-motion";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { Button } from "@/components/ui/button";
import { coach } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-8 md:pt-24">
        <ContainerScroll
          titleComponent={
            <div className="mx-auto max-w-3xl text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-primary"
              >
                {coach.belt}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="text-balance font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl"
              >
                Private{" "}
                <span className="text-primary">Jiu-Jitsu</span>
                <br />
                lessons with {coach.name.split(" ")[0]}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                One-on-one coaching built around you — from your very first day
                on the mat to the competition podium. {coach.location}.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                <a href="#booking">
                  <Button size="lg">Book a session</Button>
                </a>
                <a href="#about">
                  <Button size="lg" variant="outline">
                    Meet your coach
                  </Button>
                </a>
              </motion.div>
            </div>
          }
        >
          <PhotoSlot
            label="Landscape hero — Lily competing at the IBJJF European Championship"
            aspect="aspect-[16/9]"
            className="mx-auto max-w-4xl"
          />
        </ContainerScroll>
      </div>
    </section>
  );
}
