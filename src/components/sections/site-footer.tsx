// lucide-react v1 dropped brand marks (no Instagram glyph); AtSign reads as a handle.
import { AtSign, Mail } from "lucide-react";

import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-medium uppercase tracking-[0.22em] text-foreground">
            {siteConfig.coach.displayName}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Private Brazilian Jiu-Jitsu lessons · Team {siteConfig.coach.team}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <Mail className="size-4" strokeWidth={1.5} aria-hidden />
            {siteConfig.contact.email}
          </a>
          <a
            href={siteConfig.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <AtSign className="size-4" strokeWidth={1.5} aria-hidden />
            {siteConfig.contact.instagram}
          </a>
        </div>
      </div>
    </footer>
  );
}
