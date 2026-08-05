import { availability, booking, coach, sessionLengthMinutes } from "./site-config";

export type SlotStatus = "open" | "mine" | "taken" | "past";

export type Slot = {
  id: string; // ISO start time, used as a stable key
  start: Date;
  end: Date;
  status: SlotStatus;
};

export type Day = {
  date: Date;
  label: string; // e.g. "Mon"
  dayNumber: number; // e.g. 14
  monthLabel: string; // e.g. "Apr"
  slots: Slot[];
};

export type BookingDetails = {
  name: string;
  email: string;
  goal?: string;
};

export type Booking = BookingDetails & {
  slotId: string;
  createdAt: string;
};

const STORAGE_KEY = "coach-lily:bookings";

/* ---------------------------- date helpers ---------------------------- */

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // week starts Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const startStr = weekStart.toLocaleDateString("en-GB", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const endStr = weekEnd.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

/* ---------------------------- local storage ---------------------------- */

function readBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

/* ---------------------------- slot building ---------------------------- */

function buildSlotsForDay(date: Date, myBookingIds: Set<string>): Slot[] {
  const weekday = date.getDay();
  const hours = availability[weekday] ?? [];
  const now = new Date();
  const minBookable = new Date(now.getTime() + booking.minNoticeHours * 3600_000);

  return hours.map((hour) => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + sessionLengthMinutes * 60_000);
    const id = start.toISOString();

    let status: SlotStatus;
    if (myBookingIds.has(id)) {
      status = "mine";
    } else if (start < minBookable) {
      status = "past";
    } else {
      status = "open";
    }

    return { id, start, end, status };
  });
}

/* -------------------------------------------------------------------------
 * BACKEND INTEGRATION POINT
 * -------------------------------------------------------------------------
 * These three functions are the only place that decides what exists and who
 * holds it. Replace their bodies with calls to a database (via a Next.js route
 * handler) or a hosted scheduler like Cal.com. The components consume only
 * these signatures and need no changes.
 * ---------------------------------------------------------------------- */

/** fetchWeek(weekStart) → Day[] */
export async function fetchWeek(weekStart: Date): Promise<Day[]> {
  const myIds = new Set(readBookings().map((b) => b.slotId));

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      dayNumber: date.getDate(),
      monthLabel: date.toLocaleDateString("en-GB", { month: "short" }),
      slots: buildSlotsForDay(date, myIds),
    };
  });
}

/** createBooking(slot, details) → Booking */
export async function createBooking(slot: Slot, details: BookingDetails): Promise<Booking> {
  const bookings = readBookings();
  const record: Booking = {
    ...details,
    slotId: slot.id,
    createdAt: new Date().toISOString(),
  };
  bookings.push(record);
  writeBookings(bookings);
  return record;
}

/** cancelBooking(slotId) → void */
export async function cancelBooking(slotId: string): Promise<void> {
  const bookings = readBookings().filter((b) => b.slotId !== slotId);
  writeBookings(bookings);
}

/** Convenience: look up a stored booking (used to show details on cancel). */
export function getMyBooking(slotId: string): Booking | undefined {
  return readBookings().find((b) => b.slotId === slotId);
}

export { coach };
