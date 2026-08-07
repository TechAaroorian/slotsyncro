# SlotSyncro — Project Master Architecture & Context File

## 1. Executive Summary & Portfolio Objectives

- **Project Name:** SlotSyncro
- **Concept:** Modern hybrid scheduling platform (Calendly + Doodle clone) built as a portfolio showcase for recruiters and engineering leads.
- **Key Engineering Highlights:** Timezone conversion engine, monorepo architecture, serverless WebSocket database pooling, full i18n localization routing, drag-to-select heatmaps, and optimized Vitest CI pipelines.

---

## 2. Tech Stack & Workspace Architecture

### Infrastructure & Monorepo

- **Workspace Manager:** Turborepo with `pnpm` workspaces (`apps/app`, `packages/db`, `packages/ui`).
- **Framework:** Next.js (App Router, React Server Components, Server Actions).
- **Styling & Components:** Tailwind CSS, Shadcn UI components, `lucide-react`.
- **Localization:** `next-intl` (URL-based locale routing, e.g., `/en/...`, `/es/...`).
- **Database & ORM:** Neon Serverless PostgreSQL, Prisma ORM using `@prisma/adapter-neon` with WebSockets (`ws` package) and a local development global singleton pattern.
- **Auth Strategy:** Auth.js / NextAuth (GitHub OAuth, database session adapter).
- **Testing & CI/CD:** Vitest (running in `happy-dom` environment), `@vitest/coverage-v8`, GitHub Actions workflow (`coverage.yml`).

---

## 3. Workspace Directory Map (`apps/app`)

```text
SlotSyncro/
├── apps/
│   └── app/
│       ├── actions/
│       │   ├── availability.ts     # Server Action: save/update weekly schedule
│       │   └── event-type.ts       # Server Action: create/update event type & slug validation
│       ├── app/
│       │   └── [locale]/           # next-intl localized app routing
│       │       ├── (dashboard)/    # Authenticated user management dashboard
│       │       └── [username]/     # Public booking pages (e.g. /[username]/[slug])
│       ├── components/
│       │   ├── availability/       # Weekly schedule grid UI components
│       │   ├── event-types/        # Event type forms & dynamic slug generation UI
│       │   └── ui/                 # Shadcn UI primitives (Button, Form, Input, etc.)
│       ├── lib/
│       │   ├── availability/
│       │   │   ├── __tests__/
│       │   │   │   └── engine.test.ts  # Vitest unit tests for timezone slot engine
│       │   │   └── engine.ts           # Core slot generator & conflict checker logic
│       │   ├── validations/
│       │   │   ├── index.ts        # Barrel export re-exporting all Zod schemas
│       │   │   ├── availability.ts # Zod schema for 7-day schedule + host timezone
│       │   │   ├── event-type.ts   # Zod schema for duration, buffers, slug
│       │   │   └── poll.ts         # Zod schema for group poll creation & votes
│       │   └── utils.ts            # Dynamic Tailwind `cn()` merge helper
│       └── messages/
│           └── en.json             # Scoped i18n translation strings
└── packages/
    └── db/
        └── prisma/
            └── schema.prisma       # Database models: User, EventType, Availability, Booking, Poll

```

---

## 4. Core Subsystems & Domain Logic

### A. Availability & Timezone Engine (`apps/app/lib/availability/engine.ts`)

1. **Host Window Parsing:** Working hours (e.g., `09:00` to `17:00`) entered in the Host’s timezone (e.g., `America/New_York`) are parsed and converted to exact UTC `Date` objects using `date-fns-tz` (`fromZonedTime`).
2. **Buffer Application:** Each candidate slot projects a required total blocking time window: `[slotStart - bufferBefore, slotEnd + bufferAfter]`.
3. **Conflict Detection:** The projected window is checked against existing UTC bookings (`Booking.startTime` & `Booking.endTime`). Conflicting slots are filtered out.
4. **Guest Time Formatting:** Valid UTC slots are converted and formatted for display in the Guest’s local timezone (e.g., `Asia/Kolkata`) using `formatInTimeZone`.

### B. Zod Validations Architecture (`apps/app/lib/validations/`)

All form inputs and Server Action payloads are validated strictly with Zod.

- **`eventTypeSchema`:** Title (3–100 chars), lower-case URL slug (`/^[a-z0-9-]+$/`), duration (5–480 mins), and pre/post buffer times.
- **`updateAvailabilitySchema`:** Requires valid host timezone string and a 7-day array (`dayOfWeek: 0..6`) with `HH:MM` time ranges (`startTime < endTime`).
- **`index.ts` Barrel Export:** Ensures unified imports across Server Actions and components (`import { eventTypeSchema } from "@/lib/validations"`).

### C. Localization Architecture (`next-intl`)

- Translation dictionaries are grouped by UI domain (`EventTypes`, `Availability`).
- Client components consume hooks via `useTranslations("EventTypes")`.
- Server Actions throw internal error keys (e.g., `"SLUG_EXISTS"`), allowing Client Forms to translate errors dynamically into the active user locale.

### D. Serverless Database Optimization (`packages/db`)

- PostgreSQL database hosted on **Neon Serverless**.
- Prisma ORM configured with `@prisma/adapter-neon` over WebSockets to eliminate cold-start query latency and connection pool exhaustion in serverless runtimes.
- Dev singleton pattern via `globalThis` prevents "too many clients" crashes during Next.js Hot Module Replacement (HMR).

---

## 5. Git Branch History & Status

- **Current Active Branch:** `feature/availability-engine`
- **Recent Merged Branches on `main`:**

1. `feature/prisma-database-schema`: Schema defined for Users, Event Types, Availability, Bookings, and Polls.
2. `feature/testing-setup`: Migrated Vitest from `jsdom` to `happy-dom`, fixed CI worker crashes in GitHub Actions, and updated coverage workflow.

---

## 6. Immediate Development Checklist

- [x] Create Zod schemas for Event Types and Availability in `@/lib/validations/`.
- [x] Move Zod schemas into `apps/app/lib/validations/` with `index.ts` barrel export.
- [x] Implement core timezone slot calculation engine (`apps/app/lib/availability/engine.ts`).
- [x] Build Server Actions for `createEventType` and `updateAvailability`.
- [x] Integrate `next-intl` translation keys in `messages/en.json`.
- [x] Add Vitest unit test for availability calculations (`engine.test.ts`).
- [ ] Build interactive 7-day availability UI schedule grid component (`schedule-form.tsx`).
- [ ] Implement public booking page route (`apps/app/app/[locale]/[username]/[slug]/page.tsx`).
