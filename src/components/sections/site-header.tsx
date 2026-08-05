import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const links = [
  { href: "#coach", label: "Coach" },
  { href: "#lessons", label: "Lessons" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    // White bar floating over the dark hero — the sportswear-store pattern.
    <header className="surface-light sticky top-0 z-50 border-b border-border bg-background text-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link
          href="#top"
          className="font-display text-sm font-bold uppercase tracking-[0.22em]"
        >
          {siteConfig.coach.displayName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200 hover:text-muted-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#book"
          className={buttonVariants({ variant: "pill", size: "sm" })}
        >
          Book a lesson
        </a>
      </div>
    </header>
  );
}
