"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Dot, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import {
  addDays,
  cancelBooking,
  coachNow,
  createBooking,
  fetchWeek,
  formatDayLabel,
  formatHour,
  formatRangeLabel,
  formatSlotLong,
  startOfWeek,
  type BookingDetails,
  type Day,
  type Slot,
} from "@/lib/booking";

type DialogMode = { kind: "book"; slot: Slot } | { kind: "cancel"; slot: Slot };

/** Everything the loader resolves for one week, committed in a single update. */
type WeekData = {
  /** Offset this payload belongs to, so a stale response can't overwrite a newer one. */
  offset: number;
  /** Monday of the current week in Lily's timezone. */
  thisWeek: string;
  weekStart: string;
  days: Day[];
};

export function Booking() {
  // Navigation is tracked as an offset from "this week" rather than an absolute
  // date: the current week depends on the clock, and this page is statically
  // prerendered, so the real date can only be resolved on the client.
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<WeekData | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState<DialogMode | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const thisWeek = startOfWeek(coachNow().dateKey);
      const weekStart = addDays(thisWeek, weekOffset * 7);
      const days = await fetchWeek(weekStart);
      if (!cancelled) {
        setData({ offset: weekOffset, thisWeek, weekStart, days });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [weekOffset, reloadKey]);

  // Derived, not stored: we are loading whenever the payload we hold does not
  // match the week currently selected.
  const loading = data === null || data.offset !== weekOffset;
  const weekStart = data ? addDays(data.thisWeek, weekOffset * 7) : null;

  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset < siteConfig.booking.weeksBookable - 1;

  async function handleBook(details: BookingDetails) {
    if (dialog?.kind !== "book") return;
    const slot = dialog.slot;
    await createBooking(slot, details);
    setDialog(null);
    setConfirmation(`You're booked for ${formatSlotLong(slot)}.`);
    setReloadKey((key) => key + 1);
  }

  async function handleCancel() {
    if (dialog?.kind !== "cancel") return;
    const slot = dialog.slot;
    await cancelBooking(slot.id);
    setDialog(null);
    setConfirmation(`Your ${formatSlotLong(slot)} lesson was cancelled.`);
    setReloadKey((key) => key + 1);
  }

  return (
    <Section id="book" className="py-24 md:py-36">
      <Container>
        <Reveal>
          <p className="eyebrow">Book a Lesson</p>
          <h2 className="mt-6 max-w-2xl text-balance font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight md:text-7xl">
            Pick a time that works
          </h2>
        </Reveal>

        {/* Week navigation */}
        <div className="mt-12 flex items-center justify-between gap-4 border-b border-border pb-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((offset) => offset - 1)}
            disabled={!canGoBack || loading}
            aria-label="Previous week"
          >
            <ChevronLeft aria-hidden />
          </Button>

          <div className="text-center">
            <p className="font-display text-sm font-medium uppercase tracking-[0.18em] text-foreground">
              {weekStart ? formatRangeLabel(weekStart) : "—"}
            </p>
            {weekOffset === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">This week</p>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((offset) => offset + 1)}
            disabled={!canGoForward || loading}
            aria-label="Next week"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted-foreground">
          <span>
            Private lesson times shown in {siteConfig.coach.displayName}&rsquo;s
            local time ({siteConfig.coach.timezoneLabel})
          </span>
          <Dot className="size-4" aria-hidden />
          <span>{siteConfig.pricing.sessionMinutes}-minute sessions</span>
        </p>

        {/* Availability grid */}
        <div className="mt-8 min-h-[18rem]" aria-live="polite" aria-busy={loading}>
          {loading || !data ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card/40">
              <Loader2
                className="size-5 animate-spin text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                Loading availability…
              </p>
            </div>
          ) : (
            <WeekGrid days={data.days} onSelect={setDialog} />
          )}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Tap an open slot to book. Already booked and need to change plans? Tap
          your slot to cancel it yourself.
        </p>

        {confirmation ? (
          <p
            role="status"
            className="mt-5 rounded-lg border border-primary/40 bg-primary/10 px-5 py-4 text-sm text-foreground"
          >
            {confirmation}
          </p>
        ) : null}

        <Legend />
      </Container>

      {dialog?.kind === "book" ? (
        <BookingDialog
          slot={dialog.slot}
          onClose={() => setDialog(null)}
          onSubmit={handleBook}
        />
      ) : null}

      {dialog?.kind === "cancel" ? (
        <CancelDialog
          slot={dialog.slot}
          onClose={() => setDialog(null)}
          onConfirm={handleCancel}
        />
      ) : null}
    </Section>
  );
}

/* ------------------------------------------------------------------ */

function WeekGrid({
  days,
  onSelect,
}: {
  days: Day[];
  onSelect: (mode: DialogMode) => void;
}) {
  const hasAnySlot = days.some((day) => day.slots.length > 0);

  if (!hasAnySlot) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-border bg-card/40 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          No sessions open this week. Try the next one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const label = formatDayLabel(day.dateKey);
        const bookable = day.slots.filter((slot) => slot.status !== "past");

        return (
          <div
            key={day.dateKey}
            className="rounded-xl border border-border bg-card/40 p-3"
          >
            <div className="px-1 pb-3 pt-1">
              <p className="font-display text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {label.weekday}
              </p>
              <p className="mt-0.5 text-sm text-foreground">
                {label.month} {label.day}
              </p>
            </div>

            {bookable.length === 0 ? (
              <p className="px-1 pb-2 text-xs text-muted-foreground/70">
                {day.slots.length === 0 ? "Rest day" : "No times left"}
              </p>
            ) : (
              <ul className="space-y-2">
                {bookable.map((slot) => (
                  <li key={slot.id}>
                    <SlotButton slot={slot} onSelect={onSelect} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SlotButton({
  slot,
  onSelect,
}: {
  slot: Slot;
  onSelect: (mode: DialogMode) => void;
}) {
  const time = formatHour(slot.hour);

  if (slot.status === "taken") {
    return (
      <span
        className="block cursor-not-allowed rounded-md border border-border/60 px-3 py-2 text-center text-sm text-muted-foreground/50 line-through"
        aria-label={`${time}, already booked`}
      >
        {time}
      </span>
    );
  }

  const isMine = slot.status === "mine";

  return (
    <button
      type="button"
      onClick={() =>
        onSelect({ kind: isMine ? "cancel" : "book", slot })
      }
      className={cn(
        "w-full cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isMine
          ? "border-primary bg-primary text-primary-foreground hover:bg-accent"
          : "border-input bg-secondary text-foreground hover:border-primary hover:bg-primary/10",
      )}
      aria-label={
        isMine
          ? `Your lesson at ${time}. Activate to cancel.`
          : `Book ${time}`
      }
    >
      {isMine ? "Booked" : time}
    </button>
  );
}

function Legend() {
  return (
    <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
      <li className="flex items-center gap-2">
        <span className="size-3 rounded-sm border border-input bg-secondary" />
        Open
      </li>
      <li className="flex items-center gap-2">
        <span className="size-3 rounded-sm bg-primary" />
        Your lesson
      </li>
      <li className="flex items-center gap-2">
        <span className="size-3 rounded-sm border border-border/60" />
        Taken
      </li>
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs — native <dialog> gives focus trapping and Esc-to-close free */
/* ------------------------------------------------------------------ */

function Modal({
  children,
  onClose,
  labelledBy,
}: {
  children: React.ReactNode;
  onClose: () => void;
  labelledBy: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node && !node.open) node.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === ref.current) ref.current?.close();
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-0 text-card-foreground backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {children}
    </dialog>
  );
}

function BookingDialog({
  slot,
  onClose,
  onSubmit,
}: {
  slot: Slot;
  onClose: () => void;
  onSubmit: (details: BookingDetails) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { pricing } = siteConfig;

  return (
    <Modal onClose={onClose} labelledBy="booking-dialog-title">
      <form
        className="p-7"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitting(true);
          await onSubmit({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            note: String(data.get("note") ?? ""),
            withPartner: data.get("partner") === "on",
          });
          setSubmitting(false);
        }}
      >
        <p className="eyebrow">Confirm your session</p>
        <h3
          id="booking-dialog-title"
          className="mt-3 font-display text-xl font-semibold uppercase tracking-wide"
        >
          {formatSlotLong(slot)}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {pricing.sessionMinutes} minutes · {pricing.currencySymbol}
          {pricing.single} · {siteConfig.coach.timezoneLabel}
        </p>

        <div className="mt-7 space-y-4">
          <Field label="Your name" name="name" required autoComplete="name" />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field
            label="Anything I should know?"
            name="note"
            placeholder="Goals, injuries, belt level…"
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-sm">
            <input
              type="checkbox"
              name="partner"
              className="mt-0.5 size-4 cursor-pointer accent-[var(--primary)]"
            />
            <span className="text-muted-foreground">
              I&rsquo;m bringing a training partner{" "}
              <span className="text-foreground">
                (+{pricing.partnerSurchargePercent}%, split between you)
              </span>
            </span>
          </label>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            disabled={submitting}
          >
            Back
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : null}
            {submitting ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CancelDialog({
  slot,
  onClose,
  onConfirm,
}: {
  slot: Slot;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal onClose={onClose} labelledBy="cancel-dialog-title">
      <div className="p-7">
        <p className="eyebrow">Cancel this lesson</p>
        <h3
          id="cancel-dialog-title"
          className="mt-3 font-display text-xl font-semibold uppercase tracking-wide"
        >
          {formatSlotLong(slot)}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The slot goes back on the calendar for someone else. You can rebook any
          open time afterwards.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            disabled={submitting}
          >
            Keep it
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              await onConfirm();
              setSubmitting(false);
            }}
          >
            {submitting ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : null}
            {submitting ? "Cancelling…" : "Cancel lesson"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  name,
  ...props
}: React.ComponentProps<"input"> & { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted-foreground">{label}</span>
      <input
        name={name}
        className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        {...props}
      />
    </label>
  );
}
