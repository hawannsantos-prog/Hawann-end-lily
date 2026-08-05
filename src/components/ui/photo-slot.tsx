import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Designed placeholder frame. Ships instead of stock photography so an
 * unrelated athlete is never presented as Lily. Each frame is labelled with
 * the photo that belongs there — replace with next/image when real photos
 * are available.
 */
export function PhotoSlot({
  label,
  className,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-card",
        aspect,
        className,
      )}
      role="img"
      aria-label={`Placeholder for photo: ${label}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-muted),transparent_70%)]"
      />
      <ImageIcon className="relative mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="relative max-w-[80%] text-center font-display text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
