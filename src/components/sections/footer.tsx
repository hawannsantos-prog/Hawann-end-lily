import { Instagram, Mail } from "lucide-react";
import { coach, contact } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="font-display text-2xl font-bold uppercase tracking-tight">
              {coach.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {coach.tagline} · {coach.location}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4 text-primary" aria-hidden />
              {contact.email}
            </a>
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4 text-primary" aria-hidden />
              {contact.instagram}
            </a>
          </div>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {coach.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
