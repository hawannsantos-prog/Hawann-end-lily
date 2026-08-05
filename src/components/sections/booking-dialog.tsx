"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBooking, formatSlotTime, type Slot } from "@/lib/booking";
import { sessionLengthMinutes } from "@/lib/site-config";

export function BookingDialog({
  slot,
  onClose,
  onBooked,
}: {
  slot: Slot | null;
  onClose: () => void;
  onBooked: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (slot && !dialog.open) {
      dialog.showModal();
      setName("");
      setEmail("");
      setGoal("");
    } else if (!slot && dialog.open) {
      dialog.close();
    }
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    await createBooking(slot, { name, email, goal: goal || undefined });
    setSubmitting(false);
    onBooked();
  };

  const dateLabel = slot
    ? slot.start.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      aria-labelledby="booking-dialog-title"
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-border bg-card p-0 text-foreground backdrop:bg-black/70"
    >
      {slot && (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="booking-dialog-title"
                className="font-display text-2xl font-bold uppercase tracking-tight"
              >
                Confirm booking
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateLabel} · {formatSlotTime(slot.start)} ·{" "}
                {sessionLengthMinutes} min
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Full name" htmlFor="bk-name">
              <input
                id="bk-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring"
              />
            </Field>
            <Field label="Email" htmlFor="bk-email">
              <input
                id="bk-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring"
              />
            </Field>
            <Field label="What do you want to work on? (optional)" htmlFor="bk-goal">
              <textarea
                id="bk-goal"
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring"
              />
            </Field>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm"}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
