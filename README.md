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

Values to set before this goes live:

| Value | Where | Currently |
| --- | --- | --- |
| Timezone | `coach.timezone` / `coach.timezoneLabel` | `Europe/London` / "UK time" |
| Contact | `contact.email` / `contact.instagram` | placeholders |
| Package rate | `pricing.packageRate` | `null` — tier hidden |
| Partner rate | `pricing.partnerSurchargePercent` | `null` — tier hidden |

The single lesson is **$130 per 60 minutes**. The multi-lesson and partner tiers
are `null`, so the pricing section renders one clean price instead of a
placeholder. Set either to a number and its card appears automatically.

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

### Light and dark surfaces

The page alternates between two visual registers:

- **Light sections** (coach, lessons, Gracie Barra, pricing, booking) —
  sportswear-store language: white canvas, very large tight uppercase headlines,
  image-led cards, solid black pill CTAs.
- **Dark sections** (hero, championship titles, footer) — the cinematic stage.

Both come from the same token names. `<Section>` sets `.surface-light` and
`<Stage>` sets `.surface-dark`, each redefining `--background`, `--foreground`,
`--primary` and friends in place — so buttons, cards and the whole booking
calendar re-theme themselves just by being inside one. No component takes a
light/dark prop.

The light surface uses a darker red (`#c81e1e`) than the dark one: `#dc2626` on
white is only 4.0:1, below the 4.5:1 minimum.

### 3D championship medals

The titles section renders three real WebGL medals (gold, silver, bronze) that
spin under the same red stage lighting — see
[`ui/medal-3d.tsx`](src/components/ui/medal-3d.tsx).

- **Procedural geometry, no model files.** A medal is a disc, a rim torus, a
  boss and a ribbon — a few hundred triangles. A `.glb` would be a megabyte-plus
  asset to host and cache for the same result.
- **No HDRI download.** Metal needs something to reflect; the environment is
  built in-scene from `<Lightformer>` panels, so it costs one 128px cube render
  and fetches nothing.
- **Three.js is loaded lazily** (`next/dynamic`, `ssr: false`) so ~600 KB never
  blocks first paint. The fallback holds the same footprint — no layout shift.
- **The render loop stops when off screen** (IntersectionObserver drives
  `frameloop`), and DPR is capped at 1.5, so phones don't burn battery.
- Under `prefers-reduced-motion` the medals hold still.

### The cinematic treatment

Styled after immersive product showcases (the Adidas × Foot Locker "Chile 20"
site was the reference): subjects posed on a dark stage, lit from above, with red
rim lights raking in from the sides.

- **[`ui/stage.tsx`](src/components/ui/stage.tsx)** — `<Stage>` wraps a section
  in studio lighting: key light from above, red side rims, a vertical beam behind
  the subject, and haze so the light reads as volumetric. `<LightPool>` is the
  pool of light an object casts on the floor. All pure CSS gradients — no images,
  no WebGL, nothing to download.
- **[`ui/reveal.tsx`](src/components/ui/reveal.tsx)** — fades and lifts content
  in as it scrolls into view, staggered across siblings.
- **[`ui/count-up.tsx`](src/components/ui/count-up.tsx)** — the "1,000+" schools
  figure counts up on first view.
- **Film grain + vignette** — one `::after` on `<body>` (`.cinematic-grade` in
  `globals.css`), using an inline SVG turbulence filter.

The reference site is a real-time 3D scene with modelled products. This is the
same *lighting and staging language* rebuilt in CSS — it costs nothing to load
and works on any phone, but it is lighting around your photos, not 3D geometry.
Which means: **the effect depends on the photos.** On empty placeholder frames it
reads as atmosphere; with real photos of Lily on the mats it reads as a showcase.

Accessibility: visible keyboard focus throughout, `aria-label`s on every slot
button, `aria-live` on the availability grid, native `<dialog>` for focus
trapping and Esc-to-close, and `prefers-reduced-motion` respected — reveals and
the counter render their final state instead of animating.
