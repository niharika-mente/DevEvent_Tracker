# DevEvent Tracker — Agent Guide

## Stack
- **Next.js 16** (App Router) + **React 19** + TypeScript
- **MongoDB** via Mongoose in server actions (no Prisma)
- **Tailwind CSS v4** (`@tailwindcss/postcss`, no `tailwind.config.ts`)
- **shadcn/ui** New York style (registered but no UI primitives pulled yet)
- Cloudinary (image upload), PostHog (analytics), sonner (toasts)

## Key commands
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint (next/core-web-vitals + TS) |
| `npm run start` | Start production server |

No test framework is configured.

## Architecture
- **Pages:** `/` (home with search+filter), `/events`, `/events/[slug]`, `/create-event`, `/my-bookings`, `/watchlist`
- **No nested layouts** beyond root layout.tsx
- **Server Actions** in `lib/actions/*.actions.ts` — this is the primary data layer (no API routes except one)
- **Single API route:** `GET /api/events/[slug]` (used only by EventDetails server component via fetch)
- **Database models:** `database/event.model.ts`, `database/booking.model.ts` (Mongoose schemas with pre-save hooks)
- **Path alias:** `@/` maps to project root (e.g. `@/lib/mongodb`)

## Data flow
```
Event details page: EventDetails (server) → fetch /api/events/[slug] → display + BookEvent form
Booking form: BookEvent (client) → createBooking() server action → revalidatePath
Event creation: CreateEventForm (client) → createEvent() server action → revalidatePath
```

## Quirks & gotchas
- `next.config.ts` sets `typescript.ignoreBuildErrors: true` — TS errors do not block builds
- Husky only has a `commit-msg` hook (no pre-commit). Commitlint enforces conventional commits (11 types, kebab-case scope, lowercase subject, max 72 chars)
- `EventDetails` uses React `'use cache'` + `cacheLife('hours')` + `next: { revalidate: 60 }`
- Tailwind v4: use `@import "tailwindcss"` in CSS, utility directives via `@utility`, custom variants via `@custom-variant`. No `tailwind.config.ts`.
- Bookmark/watchlist is stored in `localStorage` only (no backend)
- Booking dedup is handled by a unique compound index `{ eventId, email }` in Mongoose

## Available Skills

| Skill | How it helps in this repo |
|---|---|
| `accessibility-compliance` | Audit/fix WCAG 2.2 issues in event cards, forms, modals — ARIA, screen reader, keyboard nav |
| `core-web-vitals` | Optimize LCP/INP/CLS on event listing and detail pages (images, layout shifts, interactivity) |
| `deploy-to-vercel` | Deploy app to Vercel, create preview deployments per PR |
| `eslint-prettier-config` | Extend or reconfigure ESLint (next/core-web-vitals + TS) and add Prettier |
| `mongodb-query-optimizer` | Optimize Mongoose queries on event/booking collections, improve index usage |
| `mongodb-schema-design` | Review/evolve `event.model.ts` and `booking.model.ts` schemas — embed vs reference, indexes |
| `next-best-practices` | Enforce RSC boundaries, file conventions, metadata, route handlers across App Router pages |
| `next-cache-components` | Properly use `'use cache'`, `cacheLife`, `cacheTag`, `updateTag` in `EventDetails` and other server components |
| `posthog-instrumentation` | Add PostHog event tracking (already configured) to user actions like bookings, searches, filters |
| `tailwind-design-system` | Extend design tokens, build reusable component patterns using Tailwind v4 with existing custom utilities |
| `typescript-advanced-types` | Strengthen types across server actions, Mongoose models, and shared interfaces |
| `vercel-react-best-practices` | Apply Vercel/React perf patterns to components — data fetching, bundle size, render optimization |
| `wcag-audit-patterns` | Run structured WCAG 2.2 audit with remediation guidance on any page |

## Env vars (all required for full app)
```
MONGODB_URI=             # MongoDB Atlas connection
NEXT_PUBLIC_BASE_URL=    # e.g. http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## Style conventions
- `cn()` utility from `@/lib/utils` (clsx + tailwind-merge)
- lucide-react for icons (inlined as Image in components, not @radix-ui)
- Global styles in `app/globals.css` with CSS custom properties + `@theme inline` block
- Custom utilities: `flex-center`, `text-gradient`, `glass`, `card-shadow` via `@utility`
