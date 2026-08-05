import { cn } from "@/lib/utils";

/**
 * The cinematic "studio stage" treatment: a dark room lit from above by a cone
 * of light, with red rim lights raking in from the sides and haze catching the
 * beams. Everything is pure CSS gradients — no images, no WebGL, no runtime
 * cost beyond compositing.
 *
 * Wrap a section in <Stage> to put its contents on the stage; pass
 * `floor` to add the wet-looking reflective ground plane underneath.
 */
export function Stage({
  children,
  className,
  id,
  intensity = "full",
}: {
  children: React.ReactNode;
  className?: string;
  /** Anchor target, for in-page navigation. */
  id?: string;
  /** "full" for hero moments, "soft" for supporting sections. */
  intensity?: "full" | "soft";
}) {
  const soft = intensity === "soft";

  return (
    <section id={id} className={cn("relative isolate overflow-hidden", className)}>
      {/* Key light: a broad cone falling from above centre. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -z-10",
          soft ? "h-[60%] opacity-50" : "h-[85%] opacity-90",
        )}
        style={{
          background:
            "radial-gradient(70% 55% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 35%, transparent 72%)",
        }}
      />

      {/* Red rim lights raking in from both sides. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 -z-10 w-1/2",
          soft ? "opacity-40" : "opacity-100",
        )}
        style={{
          left: 0,
          background:
            "radial-gradient(55% 60% at 0% 45%, rgba(220,38,38,0.30) 0%, rgba(220,38,38,0.08) 45%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 -z-10 w-1/2",
          soft ? "opacity-40" : "opacity-100",
        )}
        style={{
          right: 0,
          background:
            "radial-gradient(55% 60% at 100% 45%, rgba(220,38,38,0.24) 0%, rgba(220,38,38,0.06) 45%, transparent 75%)",
        }}
      />

      {/* Vertical light column behind the subject — the bright slot in the
          reference set that the products are posed against. */}
      {!soft ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[70%] w-[min(22rem,45vw)] -translate-x-1/2 opacity-70"
          style={{
            background:
              "linear-gradient(to bottom, rgba(248,113,113,0.22) 0%, rgba(220,38,38,0.10) 45%, transparent 100%)",
            filter: "blur(28px)",
          }}
        />
      ) : null}

      {/* Haze catching the beams, so the light reads as volumetric. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 30%, transparent 40%, rgba(9,9,11,0.75) 100%)",
        }}
      />

      {children}
    </section>
  );
}

/**
 * The pool of light an object casts on the studio floor beneath it.
 *
 * A literal mirrored reflection was the first instinct, but a mirror of a
 * person reads as a glitch rather than as staging — and it doubles the DOM.
 * An elliptical falloff sells "lit from above, standing on a dark floor" with
 * one element.
 */
export function LightPool({
  className,
  tone = "white",
}: {
  className?: string;
  tone?: "white" | "red";
}) {
  const colour =
    tone === "red" ? "rgba(220,38,38,0.35)" : "rgba(255,255,255,0.16)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none h-16 w-full", className)}
      style={{
        background: `radial-gradient(60% 100% at 50% 0%, ${colour} 0%, transparent 70%)`,
      }}
    />
  );
}
