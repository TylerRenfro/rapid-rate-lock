# Rapid Rate Lock — Quick Quote prototype

A clickable prototype of the broker **Quick Quote** page: build up to 3 borrower profiles, search once, compare 15 / 20 / 30-year fixed rates per profile, pick one rate per profile and lock them in. Quotes are live for 60 seconds on one shared timer.

Design source: [Figma — Rapid Rate Lock](https://www.figma.com/design/QlKYAkeAoiUsNDIyF4s21M/Rapid-Rate-Lock) (frames 01 Empty, 02 Profiles built, 03 Results, 05 Expired), styled with the **Lending Portal** library tokens.

> Prototype only: pricing is mocked, nothing leaves the browser, and "Lock in for 1 hour" only changes the button's state for now.

## Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Vite hot-reloads on every save.

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Dev server with hot reload           |
| `npm run build`   | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Lint with oxlint                     |

## Testing the timers

Add `?speed=N` to the URL to make **new** quote windows run N× faster (capped at 600). The countdown still reads 1:00 → 0:00, so you can watch Live → Warning (under 15s) → Expired without waiting:

- <http://localhost:5173/?speed=10> — a 60-second window lasts 6 seconds

The flag isn't shown anywhere in the UI.

## How state works

- Everything persists in **one localStorage key**, `rapid-rate-lock:v1` (Zustand `persist`). Reloading the page keeps profiles, results, selections and the lock state.
- Deadlines are stored as **timestamps** (`quote.expiresAt`), never as a running countdown. Time left is always `expiresAt − now`, so reloads, sleeping laptops and throttled background tabs can't make the timer drift; "expired" is simply `now ≥ expiresAt`.
- One shared clock (`useNow` in `src/lib/clock.ts`) ticks ~4×/second until the deadline, then stops. It re-checks when the tab becomes visible again.
- Two open tabs stay in sync through the browser `storage` event.
- **Reset:** clear the `rapid-rate-lock:v1` key in DevTools → Application → Local Storage (or bump the key's version in `src/lib/store.ts`).

## Stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix), themed to Lending Portal in `src/index.css`
- [Heroicons](https://heroicons.com) (same set as the Figma library), Inter + Roboto via Fontsource
- [Zustand](https://zustand.docs.pmnd.rs) for state + localStorage persistence

Browser support follows Tailwind v4: Safari 16.4+, Chrome 111+, Firefox 128+.

## Layout

```
src/
  index.css                 Lending Portal tokens → shadcn theme variables
  App.tsx                   Navbar + profile panel + results
  components/
    app-navbar.tsx          Library Navbar with Quick Quote nav + broker slot
    profile-panel.tsx       Borrower profiles accordion, Add profile, Search
    profile-fields.tsx      Profile editor fields (pricing factors only)
    results-area.tsx        Results header, rate cards, footnote, lock bar
    results-empty.tsx       Empty state (frames 01 / 02)
    quote-timer.tsx         Live / Warning / Expired timer + radial countdown
    profile-rate-card.tsx   One card per profile with 15/20/30-yr options
    lock-bar.tsx            Batch lock-in bar
    ui/                     shadcn components (restyled to the library)
  lib/
    store.ts                Zustand store, persisted to localStorage
    clock.ts                Shared clock, quote status, ?speed flag
    pricing.ts              Mock pricing (reproduces the Figma numbers)
    profiles.ts, format.ts, types.ts
```

## Responsive behaviour

- **≥ 1024px:** Figma layout — 384px profile panel beside the results.
- **< 1024px:** the profile panel stacks above the results; searching scrolls the results into view.
- Rate options sit three across when the results area is at least 768px wide, otherwise they stack.
- Once a rate is selected, the lock bar sticks to the bottom of the screen.

## Deploys

Hosted on Vercel, connected to this GitHub repo: every push to `main` deploys production, and other branches get preview URLs.
