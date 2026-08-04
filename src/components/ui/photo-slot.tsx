import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A designed placeholder for a photo that hasn't been added yet.
 *
 * Deliberately not a stock photo: this is a real athlete's site, and a picture
 * of an unrelated person presented as her would be misleading. The frame is
 * styled to look intentional while empty, and `label` tells whoever maintains
 * the site exactly which photo belongs here.
 *
 * To fill one in: drop the file in /public, then replace the <PhotoSlot /> with
 * next/image — see README.md ("Adding real photos").
 */
export function PhotoSlot({
  label,
  className,
  ratio = "portrait",
}: {
  label: string;
  className?: string;
  ratio?: "portrait" | "landscape" | "square" | "fill";
}) {
  const ratioClass = {
    portrait: "aspect-[3/4]",
    landscape: "aspect-[16/10]",
    square: "aspect-square",
    fill: "h-full w-full",
  }[ratio];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card",
        ratioClass,
        className,
      )}
    >
      {/* Subtle diagonal texture so an empty frame still reads as designed. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 9px)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"
      />
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
        <ImageIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
        <p className="max-w-[22ch] text-xs leading-relaxed text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
