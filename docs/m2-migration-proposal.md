# M2 poll-to-meeting migration proposal

**Status:** Approved direction; baseline migration established before M2 schema changes

**Milestone:** M2 — Poll to Meeting

## Objective

Deliver one complete group-scheduling path:

```text
Create a multi-date poll
  -> collect poll-scoped responses
  -> select one candidate
  -> finalize once
  -> create one confirmed meeting
  -> reject further voting
```

This proposal narrows the broader target model to the smallest migration that satisfies M2 while leaving direct-booking migration, durable notifications, team workspace UX, and calendar providers for later milestones.

## Current integrity gaps

The current schema cannot provide the M2 guarantees:

1. `Availability` repeats participant name and email for every candidate preference.
2. `Availability.pollId` and `Availability.timeSlotId` are individually valid foreign keys, but the database does not prove that the slot belongs to the same poll.
3. Anonymous identity is inferred from a mutable display name.
4. `Poll` has no lifecycle, access policy, duration, organizer timezone, deadline, or concurrency version.
5. `TimeSlot` has no uniqueness constraint for duplicate intervals and no database check that end follows start.
6. No shared `Meeting`, participant snapshot, lifecycle event, or poll-finalization record exists.
7. Two concurrent finalization requests could create two independent outcomes unless the database and transaction claim the poll exactly once.

## M2 scope decisions

### Included

- Personal workspace records as an internal ownership boundary
- Poll lifecycle and open-link access policy
- Multiple candidate dates, explicit duration, and organizer timezone
- Poll-scoped registered and accountless participants
- Required and optional participant classification
- Explicit unanswered semantics: no preference row means unanswered
- Poll management and response progress
- Atomic finalization into one meeting
- Meeting participant snapshots and initial lifecycle event
- Database-enforced cross-poll integrity and one-time finalization

### Deferred

- Team workspace creation and workspace switching UI
- Invitation-only token implementation and reminders
- Direct-booking migration to `Meeting` (M3)
- Cancellation and rescheduling lifecycle (M4)
- Durable notification/outbox processing (M5)
- Calendar and conferencing provider integration (M6)
- Fairness and timezone-inconvenience ranking (M7)
- Immersive/VR-specific product behavior

The schema may reserve stable enum values for later policies, but M2 code must not present deferred behavior as available.

## Proposed M2 data model

### Workspace foundation

`Workspace` provides the tenant boundary without exposing organization UI:

```text
Workspace
├── id
├── name
├── type = PERSONAL
├── personalOwnerUserId (unique)
├── createdAt
└── updatedAt

WorkspaceMembership
├── workspaceId
├── userId
├── role = OWNER
├── createdAt
└── unique(workspaceId, userId)
```

Every existing and newly authenticated user receives exactly one personal workspace and one owner membership. Provisioning must be idempotent. M2 moves poll ownership to the personal workspace while retaining `hostId` as the acting organizer. Other user-owned resources migrate in their scheduled milestones.

### Poll and candidates

```text
Poll
├── id
├── workspaceId
├── hostId
├── title
├── description
├── slug (unique)
├── status: DRAFT | OPEN | FINALIZED | EXPIRED | CANCELLED
├── access: OPEN_LINK | INVITATION_ONLY
├── durationMinutes
├── organizerTimeZone
├── deadlineAt (nullable)
├── version
├── createdAt
└── updatedAt

PollCandidate
├── id
├── pollId
├── startAt
├── endAt
├── createdAt
├── unique(pollId, startAt, endAt)
└── unique(id, pollId)
```

M2 initially creates polls as `OPEN` with `OPEN_LINK` access to preserve the current sharing flow. The lifecycle still models draft and restricted states so later behavior does not require another enum migration. New candidate construction uses the organizer's validated IANA timezone and stores absolute instants.

### Participants and preferences

```text
PollParticipant
├── id
├── pollId
├── userId (nullable)
├── displayName
├── email (nullable)
├── role: REQUIRED | OPTIONAL
├── responseStatus: PENDING | RESPONDED
├── respondedAt (nullable)
├── createdAt
├── updatedAt
└── unique(id, pollId)

PollPreference
├── id
├── pollId
├── participantId
├── candidateId
├── status: YES | IF_NEEDED | NO
├── createdAt
├── updatedAt
├── unique(participantId, candidateId)
├── FK(participantId, pollId) -> PollParticipant(id, pollId)
└── FK(candidateId, pollId) -> PollCandidate(id, pollId)
```

Including `pollId` in both composite foreign keys is intentional. It prevents a preference for a participant from poll A and a candidate from poll B even when both IDs exist. Display name remains presentation data rather than identity.

For open-link accountless responses, M2 issues an opaque edit token after the first response and stores only its hash. A returning anonymous participant must present that token to replace the same response. A matching display name alone must not replace another person's preferences.

### Meeting and finalization

```text
Meeting
├── id
├── workspaceId
├── origin = POLL
├── status = CONFIRMED
├── titleSnapshot
├── descriptionSnapshot
├── startAt
├── endAt
├── displayTimeZone
├── locationType (nullable)
├── locationValue (nullable)
├── version
├── createdAt
└── updatedAt

MeetingParticipant
├── id
├── meetingId
├── pollParticipantId (nullable)
├── userId (nullable)
├── role: HOST | REQUIRED | OPTIONAL
├── displayNameSnapshot
├── emailSnapshot (nullable)
└── unique(meetingId, pollParticipantId) when sourced from a poll

MeetingEvent
├── id
├── meetingId
├── type = SCHEDULED
├── actorUserId
├── occurredAt
└── metadata (nullable JSON)

PollFinalization
├── pollId (primary key)
├── candidateId
├── meetingId (unique)
├── finalizedByUserId
├── finalizedAt
├── recommendationSnapshot (nullable JSON)
└── FK(candidateId, pollId) -> PollCandidate(id, pollId)
```

Snapshots preserve what was accepted at finalization even if a user profile or poll title changes later. Provider-specific video, calendar, and immersive fields are not added in M2; the nullable general location fields are sufficient until integration design is implemented.

## Finalization transaction

The application service, not the Server Action, owns finalization:

```text
Polling.finalizePoll(command)
  -> authenticate and authorize organizer in workspace
  -> load OPEN poll and candidate scoped to that poll
  -> atomically claim poll with status + version update
  -> create Meeting from candidate and poll snapshots
  -> create host and participant snapshots
  -> create PollFinalization
  -> append MeetingEvent(SCHEDULED)
  -> commit
```

The claim uses an update condition equivalent to:

```text
poll.id = requestedPollId
AND poll.status = OPEN
AND poll.version = expectedVersion
```

Exactly one concurrent request can update that row. A request that loses the race reads `PollFinalization` and returns the already-created meeting as an idempotent success. `PollFinalization.pollId` as the primary key and unique `meetingId` are the final database safeguards.

No external email, calendar, or conferencing call occurs inside this transaction.

## Migration and release sequence

### Gate 0: establish migration authority

The repository currently has no committed Prisma migration history. Before `prisma migrate dev` or `prisma migrate deploy` is used:

1. Identify the authoritative development/staging database.
2. Decide whether existing data must be retained or is disposable.
3. If retained, create and review a baseline migration using `prisma migrate diff` rather than pretending the database is empty.
4. Check migration status and schema drift.
5. Back up any database chosen for a representative populated migration test.

Decision recorded 2026-09-08: the current database contains disposable test data. SlotSyncro will establish a clean migration history from the M1 schema and reset only the explicitly selected development database before applying M2 migrations. No production-data backfill is required for this milestone. The backfill design remains documented because future environments may contain retained data.

`prisma db push` is not the M2 production migration strategy because it does not provide the reviewed, repeatable history required for backfills and custom constraints.

### Migration A: additive foundations

- Add workspace and membership tables.
- Add nullable `Poll.workspaceId` plus lifecycle, access, duration, timezone, deadline, and version fields.
- Add new participant, preference, meeting, meeting-participant, meeting-event, and finalization tables.
- Preserve `TimeSlot` and `Availability` unchanged.
- Deploy code capable of reading the legacy flow while the new fields remain nullable.

### Backfill A: personal workspaces and polls

- Create one personal workspace and owner membership per user.
- Set each existing poll's workspace from its host's personal workspace.
- Initialize legacy polls as `OPEN` and `OPEN_LINK`.
- Set legacy duration from `endTime - startTime`; report polls with inconsistent candidate durations.
- Set organizer timezone only through an explicit policy. Do not infer it from the machine running the backfill.

### Migration B: candidates and normalized responses

- Copy each legacy `TimeSlot` to `PollCandidate`, preserving IDs where practical.
- Create participants conservatively:
  - Group authenticated rows by `(pollId, userId)`.
  - Otherwise prefer `(pollId, normalizedEmail)` when a consistent non-empty email exists.
  - Use `(pollId, normalizedDisplayName)` only for legacy rows without a durable identifier, matching current replacement behavior.
- Emit an ambiguity report for conflicting names, emails, or user IDs instead of silently merging them.
- Copy one preference per participant and candidate.
- Fail verification if any legacy response points to a candidate from another poll.

### Application cutover

- Write new polls, candidates, participants, and preferences only through polling application services.
- Read heatmaps and response progress from normalized preferences.
- Stop name-only anonymous replacement; use the hashed edit token.
- Enforce `OPEN` state and deadline on every response mutation.
- Release poll management and finalization after integration tests pass.

### Migration C: constraints and cleanup

- Make backfilled ownership and required lifecycle fields non-null.
- Add composite foreign keys, unique constraints, interval checks, and indexes through reviewed SQL.
- Stop all legacy writes.
- Reconcile row counts and aggregates.
- Remove legacy tables/columns only in a later deployment after rollback no longer depends on them.

## Backfill verification

Every backfill records before/after counts and rejects unexplained differences:

| Check | Expected result |
| --- | --- |
| Existing users vs personal workspaces | One personal workspace per user |
| Existing polls without workspace | Zero after backfill |
| Legacy time slots vs candidates | Equal count unless a documented invalid row is quarantined |
| Legacy vote rows vs preferences | Equal effective preference count after documented duplicate resolution |
| Preferences with mismatched poll relationships | Zero |
| Duplicate participant/candidate preferences | Zero |
| Candidates with `endAt <= startAt` | Zero |
| Finalized polls without finalization/meeting | Zero |
| Poll finalizations with multiple meetings | Zero |

Backfill code must be rerunnable or protected by stable uniqueness so recovery does not create duplicate workspaces, participants, candidates, or meetings.

## Rollback and forward-fix strategy

- Migrations A and B are additive, so rollback means routing application traffic back to legacy reads/writes while retaining unused new tables.
- Do not drop legacy data in the same release that switches application reads.
- If a backfill fails, fix the data or script and rerun it; do not mark an incomplete migration as successfully applied.
- After new-only writes begin, prefer a forward fix. Rolling back application code could lose visibility of newly normalized responses.
- Before destructive cleanup, take a backup and retain reconciliation output and a mapping from legacy IDs to new IDs.
- Production applies committed migrations with `prisma migrate deploy`; it never creates migrations with `migrate dev`.

## Test evidence required

### Unit tests

- IANA timezone validation and local-time-to-instant conversion
- Poll lifecycle transitions
- Candidate duration and duplicate validation
- Required/optional participant snapshot mapping
- Finalization result mapping and stable error codes

### PostgreSQL integration tests

- Composite foreign keys reject cross-poll preferences
- Composite finalization relationship rejects a candidate from another poll
- One effective preference exists per participant/candidate
- Concurrent finalization requests produce one meeting and one finalization
- Repeating finalization returns the same meeting
- Poll, meeting, participants, finalization, and event commit or roll back together
- Backfill succeeds on empty and representative populated databases

### End-to-end tests

- Organizer creates a multi-date poll and shares it
- Accountless and authenticated participants respond and revise securely
- Organizer sees response progress and finalizes a candidate
- Finalized poll shows the confirmed meeting and rejects further voting
- Double-clicking Finalize produces one visible meeting

## Review decisions required before schema implementation

1. **Resolved:** existing non-production data is disposable and may be reset after explicit target verification.
2. Select the authoritative organizer-timezone backfill policy for legacy polls.
3. Confirm that new M2 polls open immediately; draft UI remains deferred.
4. Confirm that invitation-only access is modeled but not exposed until its token and delivery flow is implemented.
5. Confirm anonymous response editing uses an opaque token rather than name/email matching.
6. Confirm direct bookings remain on `Booking` until M3 while poll finalization creates `Meeting` first.

No Prisma schema or migration should be committed until these decisions and the baseline migration strategy are reviewed.

## Prisma workflow after approval

For each migration slice:

```powershell
pnpm --filter db exec prisma migrate status
pnpm --filter db exec prisma migrate dev --create-only --name <migration-name>
# Review and, where required, edit the generated SQL.
pnpm --filter db exec prisma migrate dev
pnpm --filter db db:generate
```

Use `prisma migrate deploy` only in staging/production automation after the same migrations and backfills pass against a representative database.

## Related documents

- [Roadmap](./roadmap.md)
- [Business rules](./business-rules.md)
- [Proposed domain decisions](./domain-decisions.md)
- [Proposed domain model](./domain-model-proposed.md)
- [M0 baseline reconciliation](./baseline-m0.md)
