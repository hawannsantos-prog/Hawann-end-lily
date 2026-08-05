import { cn } from "@/lib/utils";

/**
 * A light section — the Nike half of the site.
 *
 * Sets `.surface-light`, which redefines the design tokens in place, so every
 * component inside re-themes itself without knowing it is on a light
 * background. Pair with <Stage> for the dark cinematic sections.
 */
export function Section({
  children,
  className,
  id,
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** "white" for the default canvas, "grey" for an inset band. */
  tone?: "white" | "grey";
}) {
  return (
    <section
      id={id}
      className={cn(
        // overflow-x-clip (not hidden) contains the horizontal Reveal offsets,
        // which start 36px off-axis and would otherwise widen the page on
        // narrow screens. `clip` does this without creating a scroll container,
        // so position: sticky inside still works.
        // scroll-mt clears the 4rem sticky header, so #anchor links land with
        // the heading visible instead of tucked underneath it.
        "surface-light relative scroll-mt-16 overflow-x-clip text-foreground",
        tone === "grey" ? "bg-card" : "bg-background",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** The standard content column, shared by every section. */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5", className)}>
      {children}
    </div>
  );
}
