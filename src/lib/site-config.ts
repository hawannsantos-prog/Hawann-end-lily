/**
 * Every piece of copy, price and schedule rule on the site lives here.
 * Edit this file to change the site — you should not need to touch components.
 */

export const siteConfig = {
  coach: {
    firstName: "Lily",
    displayName: "Coach Lily",
    team: "Gracie Barra",
    /**
     * IANA timezone the lesson times are expressed in. Slot times below are
     * Lily's *local* wall-clock times, exactly as the page states.
     * Change this to her real timezone, e.g. "Europe/Lisbon" or "America/New_York".
     */
    timezone: "Europe/London",
    timezoneLabel: "UK time",
  },

  /** Contact used by the booking confirmation copy. Swap in real details. */
  contact: {
    email: "hello@coachlily.com",
    instagram: "@coachlily",
    instagramUrl: "https://instagram.com/",
  },

  pricing: {
    sessionMinutes: 60,
    single: 130,
    /**
     * Multi-lesson and partner rates are OFF until you set real numbers.
     * The pricing section only renders a tier once its value is non-null, so
     * the page stays clean instead of showing a placeholder price.
     *
     * To turn the package tier on: set packageRate to the per-lesson price,
     * e.g. `packageRate: 117`. To turn partner pricing on: set
     * partnerSurchargePercent, e.g. `partnerSurchargePercent: 20`.
     */
    packageRate: null as number | null,
    packageMinimum: 5,
    partnerSurchargePercent: null as number | null,
    currency: "USD",
    currencySymbol: "$",
  },

  titles: [
    {
      title: "European Champion",
      year: "2024",
      federation: "IBJJF",
      note: "Gi",
    },
    {
      title: "No-Gi World Champion",
      year: "",
      federation: "IBJJF",
      note: "No-Gi",
    },
    {
      title: "No-Gi Pan American Champion",
      year: "",
      federation: "IBJJF",
      note: "No-Gi",
    },
  ],

  audiences: [
    {
      key: "competitors",
      name: "Competitors",
      blurb:
        "Higher-level, advanced skills from someone actively competing at Worlds, Pans & Euros level.",
    },
    {
      key: "beginners",
      name: "Beginners",
      blurb:
        "Focused on fundamentals, with ways to improve built around what each student needs in class.",
    },
    {
      key: "hobbyists",
      name: "Hobbyists",
      blurb:
        "Real progress and real fun. Jiu-Jitsu should stay something you love.",
    },
  ],

  /**
   * Weekly availability template, in Lily's local time (24h).
   * 0 = Sunday … 6 = Saturday. Each entry is the START hour of a 60-min session.
   * Remove a weekday key to close that day entirely.
   */
  availability: {
    1: [7, 8, 17, 18, 19], // Monday
    2: [7, 8, 17, 18, 19], // Tuesday
    3: [7, 8, 17, 18, 19], // Wednesday
    4: [7, 8, 17, 18, 19], // Thursday
    5: [7, 8, 16, 17], // Friday
    6: [9, 10, 11], // Saturday
  } as Record<number, number[]>,

  /** How far ahead students may book, and the minimum notice required. */
  booking: {
    weeksBookable: 6,
    minimumNoticeHours: 12,
  },
} as const;

export type SiteConfig = typeof siteConfig;
