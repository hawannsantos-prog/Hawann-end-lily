"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/sections/booking-dialog";
import {
  addWeeks,
  cancelBooking,
  fetchWeek,
  formatSlotTime,
  formatWeekRange,
  startOfWeek,
  type Day,
  type Slot,
} from "@/lib/booking";
import { booking, coach } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function BookingCalendar() {
  const thisWeekStart = useMemo(() => startOfWeek(new Date()), []);
  const [weekIndex, setWeekIndex] = useState(0);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);

  const weekStart = useMemo(
    () => addWeeks(thisWeekStart, weekIndex),
    [thisWeekStart, weekIndex],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchWeek(weekStart);
    setDays(data);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBooked = useCallback(() => {
    setActiveSlot(null);
    load();
  }, [load]);

  const handleCancel = useCallback(
    async (slot: Slot) => {
      await cancelBooking(slot.id);
      load();
    },
    [load],
  );

  const canGoBack = weekIndex > 0;
  const canGoForward = weekIndex < booking.horizonWeeks - 1;

  return (
    <section id="booking" className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-primary">
            Book a session
          </p>
          <h2 className="text-balance font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
            Pick your slot
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            All times shown in {coach.timezoneLabel}. Sessions can be booked up
            to {booking.horizonWeeks} weeks ahead, with at least{" "}
            {booking.minNoticeHours} hours&apos; notice.
          </p>
        </div>

        {/* Week navigation */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
            disabled={!canGoBack}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Prev
          </Button>
          <p
            className="font-display text-base uppercase tracking-wide md:text-lg"
            aria-live="polite"
          >
            {formatWeekRange(weekStart)}
            {weekIndex === 0 && (
              <span className="ml-2 text-sm text-primary">This week</span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setWeekIndex((i) => Math.min(booking.horizonWeeks - 1, i + 1))
            }
            disabled={!canGoForward}
            aria-label="Next week"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        {/* Availability grid */}
        <div
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
          aria-live="polite"
          aria-busy={loading}
        >
          {days.map((day) => {
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            return (
              <div
                key={day.date.toISOString()}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-display text-sm uppercase tracking-wide text-muted-foreground">
                    {day.label}
                  </span>
                  <span
                    className={cn(
                      "font-display text-lg font-bold tabular-nums",
                      isToday && "text-primary",
                    )}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                {day.slots.length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    —
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {day.slots.map((slot) => (
                      <li key={slot.id}>
                        <SlotButton
                          slot={slot}
                          onBook={() => setActiveSlot(slot)}
                          onCancel={() => handleCancel(slot)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-border bg-background" />
            Open
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-primary" />
            Your booking
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-muted" />
            Unavailable
          </span>
        </div>

        <p className="mt-8 flex items-start gap-2 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>
            Bookings are saved in your browser for this demo — they aren&apos;t
            sent to a server, so nothing is charged and a booking made here
            won&apos;t appear on another device.
          </span>
        </p>
      </div>

      <BookingDialog
        slot={activeSlot}
        onClose={() => setActiveSlot(null)}
        onBooked={handleBooked}
      />
    </section>
  );
}

function SlotButton({
  slot,
  onBook,
  onCancel,
}: {
  slot: Slot;
  onBook: () => void;
  onCancel: () => void;
}) {
  const time = formatSlotTime(slot.start);

  if (slot.status === "open") {
    return (
      <button
        onClick={onBook}
        aria-label={`Book ${time} on ${slot.start.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}`}
        className="w-full rounded-md border border-border bg-background py-1.5 text-center font-display text-sm tabular-nums transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        {time}
      </button>
    );
  }

  if (slot.status === "mine") {
    return (
      <button
        onClick={onCancel}
        aria-label={`Cancel your booking at ${time}`}
        className="group relative w-full rounded-md bg-primary py-1.5 text-center font-display text-sm tabular-nums text-primary-foreground transition-colors hover:bg-primary/80"
      >
        <span className="group-hover:hidden">{time}</span>
        <span className="hidden group-hover:inline">Cancel</span>
      </button>
    );
  }

  // past / taken
  return (
    <span
      aria-label={`${time} unavailable`}
      className="block w-full cursor-not-allowed rounded-md bg-muted py-1.5 text-center font-display text-sm tabular-nums text-muted-foreground line-through opacity-60"
    >
      {time}
    </span>
  );
}
