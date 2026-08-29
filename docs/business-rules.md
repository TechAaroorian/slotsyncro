# Business Rules

**Document status:** Initial draft  
**Scope:** Current enforcement, target invariants, and unresolved policy decisions

## Purpose

A business rule is a statement that must remain true regardless of which page, API, Server Action, background job, or integration performs an operation.

For example:

> Only an open poll accepts responses.

That rule should hold whether a response comes from the current web form, a future mobile client, an API, or an automated import.

This catalogue gives rules stable identifiers so that use cases, ER constraints, implementation code, and tests can refer to the same requirement.

## Rule status

| Status | Meaning |
| --- | --- |
| **Current** | The rule is enforced by the current implementation. |
| **Partial** | Some enforcement exists, but a bypass, race, or inconsistency remains. |
| **Proposed** | The rule belongs to the accepted target behavior but is not implemented. |
| **Unresolved** | Product or policy decision is required before accepting the rule. |

## Enforcement layers

| Layer | Appropriate use |
| --- | --- |
| Database constraint | Identity, uniqueness, referential integrity, required values, simple row-level checks |
| Database transaction | Multi-record transitions that must be atomic |
| Application/domain service | Contextual rules, authorization, state transitions, calculations, and policies |
| Background processor | Deadlines, retries, reminders, and durable external work |
| External provider protocol | Provider event identity, delivery semantics, and provider-specific constraints |
| UI | Guidance and early feedback only; never the sole enforcement layer |

Important rules often require more than one layer. An application can provide a friendly “slug already exists” message while a database unique constraint remains the final concurrency-safe enforcement.

## Identity and onboarding

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-ID-001 | A public username is unique after the accepted normalization policy. | Partial | Database uniqueness exists; normalization/reserved-name policy is incomplete | UC-ID-001 |
| BR-ID-002 | A user has one current onboarding state and repeating completion does not duplicate default resources. | Proposed | Application service plus database uniqueness | UC-ID-001 |
| BR-ID-003 | OAuth provider account identity is unique by provider and provider account ID. | Current | Database composite unique constraint | Authentication |
| BR-ID-004 | One email address maps to at most one current user when an email is present. | Current | Database unique nullable column | Authentication |
| BR-ID-005 | Authentication consent and calendar-access consent are separate decisions. | Proposed | OAuth scope/configuration boundary | UC-ID-001, calendar connection |

### Notes

- Username uniqueness currently exists, but case normalization and reserved words such as route names still require policy.
- OAuth login acts as account creation on first use; a separate password-based registration flow is not required by the current product.

## Authorization and tenancy

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-AUTH-001 | Every protected mutation derives authenticated identity server-side. | Current | Server Action authentication | UC-ID-001, UC-SCH-001, UC-SCH-002, UC-POL-001 |
| BR-AUTH-002 | A resource identifier identifies a record but does not grant mutation permission. | Partial | Ownership checks exist for several actions; not yet governed consistently | All mutations |
| BR-AUTH-003 | A user may mutate a personally owned resource only when its owner ID matches the authenticated identity. | Current for implemented owner actions | Application query filter | UC-SCH-001, UC-SCH-002 |
| BR-AUTH-004 | Public booking requires no account but must validate resource activity, ownership relationship, input, and abuse policy. | Partial | Resource/input validation exists; rate limiting and full slot validation do not | UC-BKG-001 |
| BR-AUTH-005 | Accountless meeting management requires an unguessable, revocable authorization mechanism; meeting ID alone is insufficient. | Proposed | Hashed management token plus application policy | UC-MTG-001, UC-MTG-002 |
| BR-AUTH-006 | Workspace-scoped mutations require current membership and sufficient permission. | Proposed | Membership query/policy and database relationships | Future workspace use cases |
| BR-AUTH-007 | Automatic actions operate only under a policy previously configured by an authorized actor. | Proposed | Durable policy plus background processor | UC-POL-003 |

## Recurring availability

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-SCH-001 | Availability time values use valid 24-hour `HH:mm` format. | Current | Zod application validation | UC-SCH-001 |
| BR-SCH-002 | Every availability window has `startTime < endTime`. | Partial | Intended by domain; not currently enforced by schema/action | UC-SCH-001 |
| BR-SCH-003 | A user has at most one recurring availability record per weekday. | Current | Database composite unique constraint | UC-SCH-001 |
| BR-SCH-004 | A disabled day produces no booking candidates even if fallback window data is stored. | Current | Availability engine checks `isAvailable` | UC-SCH-001, UC-BKG-001 |
| BR-SCH-005 | Saving a weekly schedule does not leave a partially updated week. | Proposed | Database transaction | UC-SCH-001 |
| BR-SCH-006 | Windows for the same day follow a defined overlap policy. | Unresolved | Application validation; possible normalization | UC-SCH-001 |
| BR-SCH-007 | Candidate generation applies event duration and configured pre/post buffers. | Partial | Engine supports buffers; booking UI currently supplies zero | UC-SCH-002, UC-BKG-001 |

### Important distinction

Storing fallback window data for a disabled day is not itself a contradiction. The authoritative availability decision combines `isAvailable` and the window collection. This must be documented because reading `startTime` alone would produce the wrong result.

## Event types

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-EVT-001 | Event-type slug is unique within its current user-owner scope. | Current | Database composite unique constraint | UC-SCH-002 |
| BR-EVT-002 | Slug contains only lowercase letters, digits, and hyphens and is 1–50 characters. | Current | Zod application validation | UC-SCH-002 |
| BR-EVT-003 | Event duration is between 5 and 480 minutes. | Current at application boundary | Zod validation; no database check | UC-SCH-002, UC-BKG-001 |
| BR-EVT-004 | Buffers are non-negative. | Current at application boundary | Zod validation; no database check | UC-SCH-002, UC-BKG-001 |
| BR-EVT-005 | Archived event types reject new bookings. | Current | Booking application service | UC-BKG-001 |
| BR-EVT-006 | Public booking uses persisted event-type duration and ownership rather than client claims. | Current | Booking application service | UC-BKG-001 |
| BR-EVT-007 | Deleting an event type with existing bookings follows an explicit retention policy. | Unresolved | Current foreign key cascades bookings | Event-type deletion, meeting history |

### Deletion policy warning

The current schema cascades `EventType` deletion to its bookings. That may be convenient during development, but it could erase historical scheduled records. The proposed domain model must decide whether event types are archived rather than physically deleted after use.

## Direct booking

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-BKG-001 | Booking event type belongs to the selected host. | Current | Application service compares persisted IDs | UC-BKG-001 |
| BR-BKG-002 | Booking end derives from persisted event duration. | Current | Application service | UC-BKG-001 |
| BR-BKG-003 | Pending and accepted bookings block overlapping reservations; cancelled bookings do not. | Partial | Application overlap query; not concurrency-safe | UC-BKG-001, UC-MTG-001 |
| BR-BKG-004 | A submitted slot must belong to the host's valid generated availability at submission time. | Proposed | Application/domain service with authoritative recomputation | UC-BKG-001 |
| BR-BKG-005 | A booking cannot begin in the past and follows configured minimum/maximum notice. | Proposed | Application/domain service | UC-BKG-001 |
| BR-BKG-006 | A booking is created at most once for one logical submission. | Proposed | Idempotency key plus database uniqueness | UC-BKG-001 |
| BR-BKG-007 | Calendar UID is stable and unique for the scheduled commitment. | Partial | Implemented on email-invitation feature branch; database uniqueness proposed/current with that change | UC-BKG-001, UC-MTG-002 |
| BR-BKG-008 | Booking success remains authoritative when confirmation delivery fails. | Partial | Implemented on email-invitation feature branch; durable delivery state not persisted | UC-BKG-001 |
| BR-BKG-009 | Guest email is syntactically valid and guest name satisfies accepted limits. | Current | Zod validation | UC-BKG-001 |
| BR-BKG-010 | Guest timezone has valid IANA semantics, not merely a non-empty value. | Partial | Currently checks only non-empty string | UC-BKG-001 |

### Concurrency invariant

The desired invariant is:

```text
For one host, two blocking booking intervals may not overlap.
```

The current sequence is:

```text
check for overlap -> create booking
```

Two requests can pass the check before either inserts. The final design must select a PostgreSQL-compatible enforcement strategy and document its interaction with Prisma and booking status.

## Poll lifecycle and candidates

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-POL-001 | A published poll contains at least one candidate. | Current at creation boundary | Zod minimum plus nested create | UC-POL-001 |
| BR-POL-002 | Every candidate belongs to exactly one poll. | Current | Required foreign key | UC-POL-001, UC-POL-002 |
| BR-POL-003 | Poll slug is unique under the current public URL design. | Current | Database unique constraint | UC-POL-001 |
| BR-POL-004 | Poll and initial candidates are created atomically. | Current | Prisma nested create | UC-POL-001 |
| BR-POL-005 | Poll has an explicit lifecycle: draft, open, finalized, expired, or cancelled. | Proposed | Enum/state-transition service | UC-POL-001, UC-POL-002, UC-POL-003 |
| BR-POL-006 | Only open polls accept new or revised responses. | Proposed | Application service | UC-POL-002 |
| BR-POL-007 | A finalized poll references exactly one candidate belonging to that poll. | Proposed | Composite relationship/transaction plus application rule | UC-POL-003 |
| BR-POL-008 | A poll produces at most one active resulting meeting. | Proposed | Database uniqueness plus transaction | UC-POL-003 |
| BR-POL-009 | Candidate duration and organizer timezone are explicit. | Proposed | Required model fields and validation | UC-POL-001 |
| BR-POL-010 | Candidate mutation is allowed only in lifecycle states defined by policy. | Proposed | State-transition service | UC-POL-001, UC-POL-003 |
| BR-POL-011 | Poll deadline, when present, prevents responses after its effective instant. | Proposed | Application service plus background transition | UC-POL-002, UC-POL-003 |
| BR-POL-012 | A candidate cannot end before or at its start. | Current structurally for generated one-hour candidates; proposed as general constraint | Application generation; future DB/application check | UC-POL-001 |

## Poll participants and responses

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-RES-001 | A response belongs to one poll participant and one poll. | Proposed | Participant/response relationship | UC-POL-002 |
| BR-RES-002 | A participant has at most one effective preference per candidate. | Partial | Current unique constraint uses candidate and case-sensitive free-form name | UC-POL-002 |
| BR-RES-003 | Every submitted candidate belongs to the same poll as the response. | Partial | Foreign keys exist independently; submission action does not verify cross-poll consistency | UC-POL-002 |
| BR-RES-004 | Unanswered is distinct from `NO`. | Proposed | Nullable/absent response semantics and application policy | UC-POL-002 |
| BR-RES-005 | Revising a response replaces one participant's effective preferences atomically. | Partial | Transaction exists; identity relies on case-insensitive name deletion | UC-POL-002 |
| BR-RES-006 | Private invitation and edit tokens are stored as hashes, expire or revoke according to policy, and are never logged in plaintext. | Proposed | Token service and database fields | UC-POL-002 |
| BR-RES-007 | Required and optional participant classifications affect finalization according to explicit policy. | Proposed | Polling domain service | UC-POL-003 |
| BR-RES-008 | Aggregate visibility before response is controlled by poll policy. | Proposed | Query authorization/presentation policy | UC-POL-002 |
| BR-RES-009 | One person's display-name collision does not replace another person's response. | Proposed | Durable participant identity | UC-POL-002 |

### Current integrity gap

The current vote record stores both `pollId` and `timeSlotId`, but the database does not guarantee that the referenced time slot belongs to the same poll. Both foreign keys can be individually valid while their combination is invalid.

The proposed model must enforce or structurally eliminate this mismatch.

## Meeting lifecycle

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-MTG-001 | A meeting records whether it originated from direct booking, poll finalization, or another accepted source. | Proposed | Domain model | UC-BKG-001, UC-POL-003 |
| BR-MTG-002 | A meeting follows an explicit state machine rather than arbitrary status updates. | Proposed | Domain transition service | UC-MTG-001, UC-MTG-002 |
| BR-MTG-003 | Only meetings in cancellable states may transition to cancelled. | Proposed | Domain transition service | UC-MTG-001 |
| BR-MTG-004 | Cancellation records actor, time, and optional reason. | Proposed | Required lifecycle event/audit fields | UC-MTG-001 |
| BR-MTG-005 | Cancelled meetings stop blocking availability according to policy. | Current for booking conflict query; proposed for unified meeting model | Query/domain rule | UC-MTG-001 |
| BR-MTG-006 | Rescheduling preserves one authoritative meeting identity. | Proposed | Transaction and domain model | UC-MTG-002, UC-MTG-003 |
| BR-MTG-007 | Rescheduling retains the previous schedule in history. | Proposed | Revision or lifecycle-event model | UC-MTG-002, UC-MTG-003 |
| BR-MTG-008 | Concurrent updates do not silently overwrite a newer meeting version. | Proposed | Optimistic concurrency/version field | UC-MTG-001, UC-MTG-002 |
| BR-MTG-009 | A meeting has at most one active consensus-rescheduling process by default. | Proposed | Database uniqueness/state policy | UC-MTG-003 |
| BR-MTG-010 | Abandoning a rescheduling process does not change the original meeting. | Proposed | Transaction/state model | UC-MTG-003 |
| BR-MTG-011 | Participant and host relationships survive rescheduling unless explicitly changed. | Proposed | Domain model | UC-MTG-002, UC-MTG-003 |

## Time and timezone semantics

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-TIME-001 | Stored user and schedule timezone values are valid IANA identifiers. | Partial | Current validation checks non-empty strings | UC-ID-001, UC-SCH-001 |
| BR-TIME-002 | Recurring local schedules retain the timezone in which they were defined. | Current | User timezone plus local window strings | UC-SCH-001 |
| BR-TIME-003 | Scheduled candidate and meeting instances are stored as absolute timestamps. | Current | PostgreSQL/Prisma `DateTime` | UC-BKG-001, UC-POL-001 |
| BR-TIME-004 | Local poll candidate input is converted using an explicit organizer timezone, not the server runtime timezone. | Proposed | Timezone-aware domain service | UC-POL-001 |
| BR-TIME-005 | Displayed times identify or clearly imply the viewer timezone and use locale-aware formatting. | Partial | Implemented in parts of booking; inconsistent elsewhere | All scheduling journeys |
| BR-TIME-006 | Daylight-saving transitions produce either a valid unambiguous instant or a user-visible validation decision. | Proposed | Timezone domain service and tests | UC-SCH-001, UC-POL-001 |

### Time concepts must remain separate

```text
Recurring rule: Monday at 09:00 in America/New_York
Scheduled instant: 2026-11-02T14:00:00Z
Viewer display: Monday at 19:30 in Asia/Kolkata
```

These values are related, but they are not interchangeable representations of the same field.

## Notifications and provider integrations

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-NOT-001 | External notification failure does not roll back committed booking or meeting state. | Partial | Implemented for booking email on feature branch; broader lifecycle proposed | UC-BKG-001, UC-POL-003, UC-MTG-001 |
| BR-NOT-002 | Required asynchronous work is recorded durably before delivery is considered scheduled. | Proposed | Outbox/job record in business transaction | UC-POL-003, UC-MTG-001, UC-MTG-002 |
| BR-NOT-003 | A delivery attempt has an independent status, timestamps, provider reference, and safe failure detail. | Proposed | Notification model | Notification processing |
| BR-NOT-004 | Retried provider operations reuse stable internal and provider identities where required. | Proposed | Idempotency/provider adapter | UC-BKG-001, UC-MTG-002 |
| BR-NOT-005 | Secrets and invitation/management tokens never appear in logs or persisted plaintext when hashing can satisfy verification. | Proposed | Logging policy and token service | UC-POL-002, UC-MTG-001 |
| BR-NOT-006 | Provider payloads contain only the minimum personal data needed for delivery. | Proposed | Adapter contract and privacy review | All notification flows |

## Reliability and integrity

| ID | Rule | Status | Enforcement | Related use cases |
| --- | --- | --- | --- | --- |
| BR-REL-001 | Retried commands do not create duplicate logical outcomes. | Proposed broadly | Idempotency keys and unique constraints | Creation/finalization use cases |
| BR-REL-002 | Multi-record lifecycle transitions are atomic when partial state would be invalid. | Partial | Some nested writes/transactions exist; not governed across lifecycle | UC-POL-001, UC-POL-003, UC-MTG-003 |
| BR-REL-003 | Public mutations have rate limits and abuse controls proportional to cost and exposure. | Proposed | Request boundary/infrastructure | UC-BKG-001, UC-POL-002 |
| BR-REL-004 | Error responses do not expose secrets, provider credentials, or unnecessary internal details. | Partial | Generic errors used in several actions; no documented global policy | All use cases |
| BR-REL-005 | Durable business records use timestamps sufficient to reconstruct lifecycle order. | Partial | Created/updated timestamps exist; lifecycle-event timestamps are missing | Poll and meeting lifecycle |
| BR-REL-006 | Deletion behavior preserves required historical and audit information. | Unresolved | Current cascade rules may delete history | Event type, user, workspace deletion |

## Rules requiring database support

The following rules are strong candidates for database enforcement because application-only checks are vulnerable to concurrency or alternate write paths:

| Rule | Candidate database mechanism |
| --- | --- |
| BR-ID-001 | Normalized username column or database-compatible case-insensitive uniqueness |
| BR-SCH-003 | Existing `(userId, day)` unique constraint |
| BR-EVT-001 | Existing `(userId, slug)` unique constraint; future scope may change |
| BR-BKG-003 | PostgreSQL exclusion constraint, serializable strategy, or a slot-reservation model after design evaluation |
| BR-BKG-006 | Unique idempotency key scoped to operation/owner |
| BR-POL-007 | Relationship ensuring finalized candidate belongs to poll |
| BR-POL-008 | Unique resulting meeting relationship for poll |
| BR-RES-002 | Unique `(participantId, candidateId)` |
| BR-RES-003 | Schema design that prevents cross-poll participant/candidate references |
| BR-MTG-008 | Version column used for optimistic concurrency |
| BR-MTG-009 | Conditional uniqueness or state-aware application transaction |

The exact PostgreSQL and Prisma representation will be selected during proposed ER design. This table records the invariant, not a premature implementation choice.

## Rules requiring application/domain enforcement

Database constraints are not sufficient for contextual decisions such as:

- Whether an actor has the right workspace role
- Whether an event type is currently bookable
- Whether a requested time belongs to generated availability
- Whether required participants satisfy finalization policy
- Which poll state transition is allowed
- Whether a cancellation notice window permits guest cancellation
- How timezone inconvenience contributes to recommendation ranking

These belong in module services with focused tests. The database should still enforce the simpler structural facts those decisions depend on.

## Rules-to-tests examples

| Rule | Unit test | Integration/database test | End-to-end test |
| --- | --- | --- | --- |
| BR-SCH-002 | Reject `17:00–09:00` | Optional check-constraint test | Form displays validation error |
| BR-BKG-001 | Reject event/host mismatch | Persist mismatched IDs through service and verify rejection | Tampered booking request fails |
| BR-BKG-003 | Overlap calculation cases | Concurrent booking attempts produce one success | Two browser submissions cannot double-book |
| BR-RES-003 | Reject candidate from another poll | Database/service prevents cross-poll write | Tampered vote request fails |
| BR-POL-008 | Repeated finalization returns one meeting | Concurrent finalization creates one meeting | Double-click finalize is safe |
| BR-NOT-001 | Provider failure returns separate status | Booking remains stored when provider fails | Confirmation UI shows meeting success plus warning |

Not every rule needs every test layer. Choose the lowest-cost layer that provides credible evidence, then add integration or end-to-end coverage for boundaries and concurrency.

## Unresolved policy decisions

These questions block parts of the proposed ER model:

1. Are availability windows allowed to overlap, or are they normalized automatically?
2. Are event types ever physically deleted after producing bookings?
3. What exact booking-overlap strategy will be used in PostgreSQL?
4. Does `Booking` remain the scheduled commitment or become a request/source for `Meeting`?
5. Can polls be both open-link and invitation-only?
6. Can a participant intentionally leave a candidate unanswered?
7. Which host or workspace roles may finalize, cancel, and reschedule?
8. What cancellation and rescheduling notice policies apply?
9. Is history stored as revisions, domain events, audit entries, or a combination?
10. Which durable background-work mechanism fits the deployment environment?

Unresolved rules should not be disguised as database defaults. They require explicit product and architecture decisions.

## Change process

When a business rule changes:

1. Update this catalogue and its status.
2. Review affected use cases and journeys.
3. Review database constraints and migration impact.
4. Update module/service implementation.
5. Update tests that reference the rule.
6. Record an ADR if the change is long-lived, cross-cutting, or expensive to reverse.

## Next documentation step

Create the **current domain model and ER diagram** directly from the existing Prisma schema.

The current-model document should identify:

- Entities and their present names
- Primary and foreign keys
- Cardinality and optionality
- Unique constraints and indexes
- Referential actions
- Rules currently enforced by schema
- Rules that the schema cannot currently enforce
- Naming collisions such as `Availability` meaning a poll vote while `UserAvailability` means a schedule

Only after the current model is accurate should a separate proposed ER model be designed.

