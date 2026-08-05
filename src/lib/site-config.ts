/**
 * Coach Lily — all editable content lives here.
 * Change prices, session length, titles, contact, timezone and the weekly
 * availability template without touching a single component.
 */

export type ChampionshipTitle = {
  year: string;
  event: string;
  result: string;
  belt: string;
};

export type Rate = {
  label: string;
  price: string;
  unit: string;
  note?: string;
  highlight?: boolean;
};

export const coach = {
  name: "Lily Costa",
  tagline: "Private Brazilian Jiu-Jitsu Lessons",
  belt: "Black Belt · 2nd Degree",
  location: "London, United Kingdom",
  timezone: "Europe/London",
  timezoneLabel: "UK time",
  years: 14,
  bio: [
    "I'm Lily — a black belt competitor turned private coach. I've spent the last decade on the mats of some of the toughest IBJJF divisions in the world, and now I bring that experience one-on-one.",
    "Private lessons let us move at your pace. Whether you're stepping onto the mat for the very first time, sharpening a competition game, or coming back after time away, every session is built around you.",
  ],
} as const;

export const coachesWho = [
  {
    title: "Complete beginners",
    body: "No experience needed. We start with fundamentals, safety, and building real confidence.",
  },
  {
    title: "Competitors",
    body: "Sharpen your A-game, close the gaps in your positional play, and drill under pressure.",
  },
  {
    title: "Returning students",
    body: "Rebuild your timing and conditioning after a layoff, injury, or long break.",
  },
  {
    title: "Kids & teens",
    body: "Discipline, focus, and self-defence in a patient, structured environment.",
  },
] as const;

export const titles: ChampionshipTitle[] = [
  { year: "2023", event: "IBJJF European Championship", result: "Gold — Adult Black Belt", belt: "Black" },
  { year: "2022", event: "IBJJF World Championship", result: "Silver — Adult Black Belt", belt: "Black" },
  { year: "2021", event: "IBJJF Pan Championship", result: "Gold — Adult Black Belt", belt: "Black" },
  { year: "2019", event: "IBJJF European Championship", result: "Gold — Adult Brown Belt", belt: "Brown" },
  { year: "2018", event: "ADCC Trials", result: "Gold — Women's Division", belt: "Brown" },
  { year: "2016", event: "IBJJF World Championship", result: "Bronze — Adult Purple Belt", belt: "Purple" },
];

export const rates: Rate[] = [
  {
    label: "Single Session",
    price: "£70",
    unit: "per hour",
    note: "One-on-one, tailored to your goals.",
  },
  {
    label: "5-Session Pack",
    price: "£315",
    unit: "£63 / session",
    note: "Save £35. Great for building a habit.",
    highlight: true,
  },
  {
    label: "10-Session Pack",
    price: "£590",
    unit: "£59 / session",
    note: "Save £110. Best value for serious progress.",
  },
];

export const sessionLengthMinutes = 60;

export const contact = {
  email: "coach@lilyjiujitsu.com",
  instagram: "@lily.jiujitsu",
  instagramUrl: "https://instagram.com/lily.jiujitsu",
};

/**
 * Weekly availability template.
 * Key = weekday (0 = Sunday ... 6 = Saturday), value = session start hours (24h).
 * Delete a key to close that day entirely.
 */
export const availability: Record<number, number[]> = {
  1: [7, 8, 17, 18, 19], // Monday
  2: [7, 8, 17, 18, 19], // Tuesday
  3: [7, 8, 17, 18], // Wednesday
  4: [17, 18, 19], // Thursday
  5: [7, 8, 17, 18], // Friday
  6: [9, 10, 11], // Saturday
};

export const booking = {
  /** Minimum notice (hours) before a session can be booked. */
  minNoticeHours: 12,
  /** How many weeks ahead a visitor may book. */
  horizonWeeks: 6,
};
