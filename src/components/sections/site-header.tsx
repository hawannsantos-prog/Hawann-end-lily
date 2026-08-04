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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link
          href="#top"
          className="font-display text-sm font-medium uppercase tracking-[0.22em] text-foreground"
        >
          {siteConfig.coach.displayName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#book" className={buttonVariants({ size: "sm" })}>
          Book a lesson
        </a>
      </div>
    </header>
  );
}
