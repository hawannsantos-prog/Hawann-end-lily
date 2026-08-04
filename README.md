# Coach Lily — Private Jiu-Jitsu Lessons

A one-page site for private Brazilian Jiu-Jitsu lessons: coach bio, championship
titles, rates, and a week-by-week booking calendar.

Built with **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4** ·
**shadcn/ui structure** · **framer-motion**.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
npx tsc --noEmit                 # typecheck
npx eslint .                     # lint
```

## Editing the content

**Almost everything lives in [`src/lib/site-config.ts`](src/lib/site-config.ts)** —
prices, session length, championship titles, who she coaches, contact details,
timezone, and the weekly availability template. You should not need to touch a
component to change what the site says.

Two values to set before this goes live:

| Value | Where | Currently |
| --- | --- | --- |
| Timezone | `coach.timezone` / `coach.timezoneLabel` | `Europe/London` / "UK time" |
| Contact | `contact.email` / `contact.instagram` | placeholders |

Weekly availability is a plain map of weekday → session start hours:

```ts
availability: {
  1: [7, 8, 17, 18, 19],  // Monday: 7am, 8am, 5pm, 6pm, 7pm
  6: [9, 10, 11],         // Saturday morning
  // delete a key to close that day entirely
}
```

## Adding real photos

The site ships with designed placeholder frames (`<PhotoSlot />`) rather than
stock photography — a photo of an unrelated athlete presented as Lily would
misrepresent her. Each frame is labelled with the photo that belongs there.

To fill one in:

1. Drop the image in `public/` (e.g. `public/hero.jpg`).
2. Replace the `<PhotoSlot />` with `next/image`:

```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Lily competing at the IBJJF European Championship"
  width={1400}
  height={720}
  className="mx-auto h-full rounded-2xl object-cover object-left-top"
/>
```

Photos wanted: a landscape hero shot, a portrait for the bio, and one per
championship title.

## The booking calendar

Fully working front-end: browse weeks, book an open slot, and cancel your own
booking. A 12-hour minimum notice and a 6-week booking horizon are enforced
(both configurable under `booking` in the site config).

> [!IMPORTANT]
> **Bookings are stored in the visitor's browser (`localStorage`), not on a
> server.** That means: Lily does not see them, no confirmation email is sent,
> nothing is charged, and a booking made on a phone will not appear on a laptop.
> The calendar is real UI on top of local storage — it is not yet a real booking
> system.

Wiring it up to a real backend is a contained change. Everything that decides
what exists and who holds it is in three functions at the bottom of
[`src/lib/booking.ts`](src/lib/booking.ts), marked `BACKEND INTEGRATION POINT`:

```ts
fetchWeek(weekStart)         // → Day[]
createBooking(slot, details) // → Booking
cancelBooking(slotId)        // → void
```

Replace their bodies with calls to a database (via a Next.js route handler) or a
hosted scheduler like Cal.com — the components consume only these signatures and
need no changes. The `taken` slot state is already modelled and styled; it stays
unused until a backend can report other students' bookings.

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx        fonts (Inter + Oswald), metadata
│  ├─ globals.css       design tokens
│  └─ page.tsx          section composition
├─ components/
│  ├─ ui/               reusable primitives (shadcn convention)
│  │  ├─ container-scroll-animation.tsx
│  │  ├─ button.tsx
│  │  └─ photo-slot.tsx
│  └─ sections/         page sections
└─ lib/
   ├─ site-config.ts    all editable content
   ├─ booking.ts        slot logic + backend integration point
   └─ utils.ts          cn() helper
```

### Why `components/ui`

`components.json` maps the `@/components/ui` alias to `src/components/ui`. That
folder is the convention the shadcn CLI installs into — keeping it means
`npx shadcn@latest add dialog` (or any other component) drops files exactly where
imports already expect them, with no path rewriting. `sections/` holds
page-specific composition; `ui/` holds reusable, app-agnostic pieces.

### A note on shadcn setup

`components.json`, `src/lib/utils.ts` and the design tokens in `globals.css` were
written directly rather than generated, because `ui.shadcn.com` was unreachable
from the environment this was built in. The result is identical. To add more
shadcn components locally:

```bash
npx shadcn@latest add dialog card badge
```

## Design

Dark athletic palette — near-black canvas, white type, competition red accent —
matching Gracie Barra's colours. Oswald (condensed) for display and labels, Inter
for body. Direction generated with the `ui-ux-pro-max` skill in `.claude/skills/`.

Accessibility: visible keyboard focus throughout, `aria-label`s on every slot
button, `aria-live` on the availability grid, native `<dialog>` for focus
trapping and Esc-to-close, and `prefers-reduced-motion` respected.
