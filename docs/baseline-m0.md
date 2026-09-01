# M0 Baseline Reconciliation

**Status:** Current baseline evidence  
**Baseline commit:** `ab088f6` on `chore/baseline-quality`  
**Reviewed:** 2026-08-31

## Purpose

This document records the evidence and known gaps for roadmap milestone M0. It is safe to commit: environment values, provider credentials, user data, and production identifiers are intentionally excluded.

## Validation evidence

The following commands passed from the monorepo root with pnpm 11.24.0 and Node.js 24.18.1:

```text
pnpm --filter db db:generate  Prisma Client 7.9.1 generated
pnpm lint                        2 workspace lint tasks passed
pnpm --filter app test          11 files, 45 tests passed
pnpm build                       3 Turbo tasks passed; both Next.js apps built
```

The production build requires network access because `next/font` downloads Geist and Geist Mono during compilation. Next.js 16.2.12 also warns that the `middleware.ts` filename is deprecated in favor of `proxy.ts`; this warning does not fail the build.

## Authentication baseline and environment contract

Auth.js uses JWT sessions with the Prisma adapter. Both providers use identity/login consent only; future Google Calendar authorization requires a separate consent and token contract.

| Capability | Required variables | Current evidence | Status |
| --- | --- | --- | --- |
| Auth.js session signing | `AUTH_SECRET` | Referenced implicitly by Auth.js and present by key in the local product environment | Current |
| GitHub OAuth | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Provider is configured and the product UI calls `signIn("github")` | Current; live callback still requires provider-console verification |
| Google OAuth | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Provider is configured and the product UI calls `signIn("google")`; the local environment still needs Google keys | Current in code; live callback still requires provider-console verification |
| Database-backed identity | `DATABASE_URL` | Required eagerly by `@repo/db` and Prisma CLI configuration | Current |
| Booking confirmation email | `RESEND_API_KEY` | Checked at delivery time; absence preserves booking success and returns failed email delivery | Current |

Provider-console verification must confirm these deployment-specific values before claiming a live OAuth smoke test:

- GitHub callback: `<product-origin>/api/auth/callback/github`
- Google callback: `<product-origin>/api/auth/callback/google`
- Auth.js trusted/canonical product origin for each environment
- Preview credentials and callback URLs are isolated from production

Committed templates live in `apps/app/.env.example` and `packages/db/.env.example`. Real values remain uncommitted.

## Prisma schema and migration reconciliation

`packages/db/prisma/schema.prisma` matches the entities described by the current-domain document after correcting the booking provider fields:

- Auth.js: `User`, `Account`, `Session`, `VerificationToken`
- Direct scheduling: `EventType`, `UserAvailability`, `Booking`
- Polling: `Poll`, `TimeSlot`, `Availability`
- Email baseline: optional unique `Booking.icsUid`
- Meeting location baseline: optional `Booking.meetingUrl` and `Booking.meetingProvider`

`packages/db/prisma.config.ts` declares `prisma/migrations`, but that directory does not exist. Therefore:

- Prisma Client generation is reproducible from the schema.
- Database creation and evolution are not reproducible from committed migration history.
- M1/M2 schema work must not invent a baseline migration without first identifying the authoritative database and deciding whether to baseline it or create a clean initial migration.

## Pre-migration data-quality queries

Run these read-only queries against an explicitly selected development or staging database before designing stricter constraints. Do not run them implicitly against whichever `DATABASE_URL` happens to be loaded.

### Invalid booking intervals

```sql
SELECT id, "hostId", "startTime", "endTime"
FROM "Booking"
WHERE "endTime" <= "startTime";
```

### Overlapping active bookings for one host

```sql
SELECT
  left_booking.id AS left_id,
  right_booking.id AS right_id,
  left_booking."hostId"
FROM "Booking" AS left_booking
JOIN "Booking" AS right_booking
  ON left_booking."hostId" = right_booking."hostId"
 AND left_booking.id < right_booking.id
 AND left_booking.status IN ('PENDING', 'ACCEPTED')
 AND right_booking.status IN ('PENDING', 'ACCEPTED')
 AND left_booking."startTime" < right_booking."endTime"
 AND left_booking."endTime" > right_booking."startTime";
```

### Booking host/event-type ownership mismatch

```sql
SELECT booking.id, booking."hostId", event_type."userId" AS event_type_owner
FROM "Booking" AS booking
JOIN "EventType" AS event_type ON event_type.id = booking."eventTypeId"
WHERE booking."hostId" <> event_type."userId";
```

### Invalid or duplicate poll candidates

```sql
SELECT id, "pollId", "startTime", "endTime"
FROM "TimeSlot"
WHERE "endTime" <= "startTime";

SELECT "pollId", "startTime", "endTime", COUNT(*)
FROM "TimeSlot"
GROUP BY "pollId", "startTime", "endTime"
HAVING COUNT(*) > 1;
```

### Cross-poll vote references

```sql
SELECT availability.id, availability."pollId", slot."pollId" AS slot_poll_id
FROM "Availability" AS availability
JOIN "TimeSlot" AS slot ON slot.id = availability."timeSlotId"
WHERE availability."pollId" <> slot."pollId";
```

### Inconsistent participant identity within a poll

```sql
SELECT
  "pollId",
  LOWER(TRIM("participantName")) AS normalized_name,
  COUNT(DISTINCT LOWER(TRIM(COALESCE("participantEmail", '')))) AS email_count
FROM "Availability"
GROUP BY "pollId", LOWER(TRIM("participantName"))
HAVING COUNT(DISTINCT LOWER(TRIM(COALESCE("participantEmail", '')))) > 1;
```

## Server Action result convention

New or materially changed Server Actions should return an explicit discriminated result for expected outcomes:

```ts
type ActionResult<T, Field extends string = string> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Partial<Record<Field, string[]>>;
      };
    };
```

Conventions:

1. Authentication, validation, conflicts, and expected persistence failures return `success: false` rather than mixing thrown errors and return values.
2. Unexpected errors are logged server-side with safe context and returned as a generic coded failure.
3. Redirecting form actions may use a dedicated form-state type, but their error object follows the same code/message/field-error categories.
4. Successful mutation actions return `success: true` consistently, including delete actions.
5. Provider outcomes remain nested secondary results when internal state has already committed, as implemented by booking email delivery.
6. User-facing text may be localized from stable error codes; provider messages and sensitive values are not returned directly.

Current actions predate this convention and expose known deviations:

| Action | Current deviation |
| --- | --- |
| `createBooking` | Closest to the target, but errors are strings and field errors are top-level |
| `createPoll` | Uses form-state `errors` and redirects on success |
| `submitPollVotes` | Returns an untyped string-error result |
| `createEventType` | May return `undefined` after an unexpected database error |
| `deleteEventType` | Returns `undefined` on success |
| `updateAvailability` | Throws for authentication/validation and performs multiple writes without one transaction |

Refactor these actions when their user journey is next changed; avoid a broad mechanical rewrite during M0.

## Known baseline limitations

- Google OAuth is exposed in the custom sign-in UI, but local credentials and a live callback smoke test are still required.
- OAuth callback behavior still needs a manual smoke test in an environment with registered provider callbacks.
- No committed Prisma migration history exists.
- Public booking overlap protection is query-then-insert and is not concurrency-safe.
- Poll votes can structurally reference a candidate belonging to another poll.
- Several links and redirects do not preserve locale.
- Next.js reports the `middleware.ts` to `proxy.ts` deprecation.
- Durable email delivery state and retry are proposed, not current.
