import { siteConfig } from "@/lib/site-config";

/**
 * Slots are pure wall-clock values in Lily's local timezone — a date key plus a
 * start hour. Nothing is converted into the visitor's timezone, which is exactly
 * what the page promises ("times shown in Coach Lily's local time"). Keeping the
 * model timezone-free removes a whole class of DST and offset bugs.
 */
export type SlotStatus = "open" | "taken" | "mine" | "past";

export type Slot = {
  /** Stable id, e.g. "2026-08-10T18" */
  id: string;
  /** "2026-08-10" in Lily's local timezone */
  dateKey: string;
  /** Start hour, 0-23, in Lily's local timezone */
  hour: number;
  status: SlotStatus;
};

export type Day = {
  dateKey: string;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  slots: Slot[];
};

export type BookingDetails = {
  name: string;
  email: string;
  note?: string;
  /** Student is bringing a training partner (+20%, split between them). */
  withPartner: boolean;
};

export type Booking = BookingDetails & {
  slotId: string;
  createdAt: string;
};

const STORAGE_KEY = "coachlily.bookings.v1";

/* ------------------------------------------------------------------ */
/* Date helpers — all operate on "YYYY-MM-DD" keys, no Date-object mutation */
/* ------------------------------------------------------------------ */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateKey: string, days: number): string {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Monday of the week containing `dateKey`. */
export function startOfWeek(dateKey: string): string {
  const date = fromDateKey(dateKey);
  const weekday = date.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(dateKey, offset);
}

/**
 * "Now" as seen from Lily's timezone, so the minimum-notice rule is applied
 * against her clock rather than the visitor's.
 */
export function coachNow(): { dateKey: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: siteConfig.coach.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  // Intl can emit "24" for midnight in some runtimes; normalise it.
  const hour = Number(get("hour")) % 24;
  return {
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    hour,
  };
}

export function formatHour(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
}

export function formatDayLabel(dateKey: string): { weekday: string; day: string; month: string } {
  const date = fromDateKey(dateKey);
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-US", { month: "short" }),
  };
}

export function formatRangeLabel(weekStart: string): string {
  const start = fromDateKey(weekStart);
  const end = fromDateKey(addDays(weekStart, 6));
  const sameMonth = start.getMonth() === end.getMonth();

  // Composed by hand rather than via toLocaleDateString: asking Intl for a
  // day+year pair without a month yields a garbled string ("2026 (day: 9)").
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });

  const startLabel = `${month(start)} ${start.getDate()}`;
  const endLabel = sameMonth
    ? `${end.getDate()}`
    : `${month(end)} ${end.getDate()}`;

  return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
}

export function formatSlotLong(slot: Slot): string {
  const date = fromDateKey(slot.dateKey);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return `${dateLabel} at ${formatHour(slot.hour)}`;
}

/* ------------------------------------------------------------------ */
/* Local persistence                                                   */
/* ------------------------------------------------------------------ */

function readBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    // Corrupt or unavailable storage (private mode) — behave as "no bookings".
    return [];
  }
}

function writeBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Storage full or blocked; the in-memory state still reflects the change.
  }
}

export function getMyBookings(): Booking[] {
  return readBookings();
}

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

function isBookable(dateKey: string, hour: number): boolean {
  const now = coachNow();
  const { minimumNoticeHours } = siteConfig.booking;

  // Hours between now and the slot, using whole days + hour difference.
  const days = Math.round(
    (fromDateKey(dateKey).getTime() - fromDateKey(now.dateKey).getTime()) /
      86_400_000,
  );
  const hoursAway = days * 24 + (hour - now.hour);
  return hoursAway >= minimumNoticeHours;
}

/**
 * ===================================================================
 * BACKEND INTEGRATION POINT
 * ===================================================================
 * This is the only place that decides which slots exist and who holds them.
 * Right now it reads the weekly template from `site-config.ts` and layers the
 * visitor's own bookings from localStorage on top.
 *
 * localStorage means: bookings live in ONE browser. Lily does not see them,
 * they are not confirmed by email, and nothing is charged. To make bookings
 * real, replace the body of these three functions with calls to your backend
 * (a Next.js route handler talking to a database, or Cal.com / Calendly).
 * The component layer needs no changes — it only depends on these signatures.
 * ===================================================================
 */
export async function fetchWeek(weekStart: string): Promise<Day[]> {
  // Simulated latency so the loading state is a real state, not a flash.
  await new Promise((resolve) => setTimeout(resolve, 450));

  const mine = new Set(readBookings().map((b) => b.slotId));
  // A real backend also returns slots taken by *other* students; with local
  // storage there is no such thing, so this stays empty until one is wired up.
  const takenByOthers = new Set<string>();

  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDays(weekStart, index);
    const weekday = fromDateKey(dateKey).getDay();
    const hours = siteConfig.availability[weekday] ?? [];

    const slots: Slot[] = hours.map((hour) => {
      const id = `${dateKey}T${String(hour).padStart(2, "0")}`;
      let status: SlotStatus = "open";
      if (mine.has(id)) status = "mine";
      else if (takenByOthers.has(id)) status = "taken";
      else if (!isBookable(dateKey, hour)) status = "past";
      return { id, dateKey, hour, status };
    });

    return { dateKey, weekday, slots };
  });
}

export async function createBooking(
  slot: Slot,
  details: BookingDetails,
): Promise<Booking> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const booking: Booking = {
    ...details,
    slotId: slot.id,
    createdAt: new Date().toISOString(),
  };
  const existing = readBookings().filter((b) => b.slotId !== slot.id);
  writeBookings([...existing, booking]);
  return booking;
}

export async function cancelBooking(slotId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  writeBookings(readBookings().filter((b) => b.slotId !== slotId));
}
