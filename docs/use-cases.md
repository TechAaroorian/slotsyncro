# Use Cases

**Document status:** Initial draft  
**Scope:** Core current and proposed scheduling operations

## Purpose

A use case describes how an actor and the system interact to produce one meaningful result. It is more precise than a user journey but intentionally independent of UI component names, database table names, and framework APIs.

This document is used to derive:

- Business rules
- Authorization policies
- Domain entities and relationships
- Transaction boundaries
- Idempotency requirements
- Failure and recovery behavior
- Acceptance and end-to-end tests

## Use case versus user journey

```text
User journey
    "A group finds and commits to a meeting time"

Use cases within that journey
    Create poll
    Submit response
    Revise response
    Finalize poll
    Create meeting
    Notify participants
```

A journey may contain several use cases. A use case should have one primary goal and a clearly observable result.

## Status labels

| Status | Meaning |
| --- | --- |
| **Current** | The primary success flow exists in the repository. |
| **Partial** | Some behavior exists, but documented rules or recovery paths are missing. |
| **Proposed** | Target behavior that has not been implemented. |

## Use-case template

Each use case follows this structure:

| Section | Purpose |
| --- | --- |
| Goal | Outcome the actor wants |
| Trigger | Event that starts the use case |
| Preconditions | Facts that must already be true |
| Main success flow | Normal sequence that reaches the goal |
| Alternative flows | Valid variations that may still succeed |
| Failure flows | Conditions that prevent success |
| Postconditions | Facts guaranteed after success or failure |
| Authorization | Server-side access decision |
| Idempotency/concurrency | Behavior under retries or competing requests |
| Business rules | Stable rule identifiers exercised by the use case |

## Actor model

Use cases refer to roles rather than assuming a separate stored entity for each label.

| Role | Meaning in a use case |
| --- | --- |
| User | Authenticated identity |
| Host | User responsible for a scheduling resource or meeting |
| Guest | Person requesting a direct booking |
| Participant | Person responding to or attending a group scheduling process |
| Workspace member | Proposed user authorized through membership |
| System | SlotSyncro application and durable processing |
| Provider | External email, calendar, or conferencing system |

## Use-case catalogue

| ID | Use case | Status | Primary actor |
| --- | --- | --- | --- |
| UC-ID-001 | Complete first-user onboarding | Proposed | User |
| UC-SCH-001 | Configure recurring availability | Current | Host |
| UC-SCH-002 | Create an event type | Current | Host |
| UC-BKG-001 | Create a direct booking | Current with limitations | Guest |
| UC-POL-001 | Create and publish a poll | Partial | Host |
| UC-POL-002 | Submit or revise a poll response | Partial | Participant |
| UC-POL-003 | Finalize a poll into a meeting | Proposed | Host |
| UC-MTG-001 | Cancel a meeting | Proposed | Authorized actor |
| UC-MTG-002 | Reschedule a meeting directly | Proposed | Authorized actor |
| UC-MTG-003 | Reschedule a meeting by consensus | Proposed | Host |

---

## UC-ID-001: Complete first-user onboarding

**Status:** Proposed  
**Primary actor:** Newly authenticated user  
**Goal:** Establish the minimum identity and scheduling configuration required to create a usable resource

### Trigger

The user completes OAuth authentication, and the system determines that onboarding is incomplete.

### Preconditions

- The external identity has been authenticated successfully.
- A local user account exists or can be created safely.
- The user has not completed the current onboarding version.

### Main success flow

1. System presents the identity information received from the provider.
2. User confirms or updates their display name.
3. User chooses a public username.
4. System normalizes and validates the username.
5. System verifies that the username is available and not reserved.
6. User confirms an IANA timezone.
7. User configures or accepts initial weekly availability.
8. System saves the onboarding configuration.
9. System marks the current onboarding version complete.
10. System directs the user to create a direct-booking resource or group poll.

### Alternative flows

#### A1: Provider did not supply a name

User must enter a display name before continuing.

#### A2: Suggested username is unavailable

System proposes alternatives without discarding the other onboarding fields.

#### A3: User skips availability configuration

If skipping is permitted, the system clearly marks direct-booking setup as incomplete. Skipping does not create misleading public availability.

### Failure flows

- Username becomes unavailable between validation and save.
- Timezone is not a valid supported IANA timezone.
- User account is disabled or deleted during onboarding.
- Persistence fails before onboarding is complete.

### Postconditions

#### On success

- User has a valid public identity and timezone.
- Username uniqueness is enforced durably.
- Initial availability is either configured or explicitly incomplete.
- Onboarding completion is recorded.

#### On failure

- Onboarding remains incomplete.
- The user can retry without creating duplicate personal resources.

### Authorization

The authenticated user may update only their own onboarding profile. Client-submitted user IDs are not trusted as authorization.

### Idempotency and concurrency

- Repeating completion must not create duplicate personal workspaces or default resources.
- Username availability must be protected by a unique database constraint, not only a prior query.

### Preliminary business rules

- **BR-ID-001:** A public username is unique after normalization.
- **BR-ID-002:** A user has one current onboarding state.
- **BR-TIME-001:** User timezone must be a valid IANA timezone identifier.

---

## UC-SCH-001: Configure recurring availability

**Status:** Current  
**Primary actor:** Host  
**Goal:** Define recurring working windows used to generate scheduling candidates

### Trigger

Host opens availability settings and submits a weekly schedule.

### Preconditions

- Host is authenticated.
- Host account exists.
- Submitted timezone and schedule have passed structural validation.

### Main success flow

1. Host selects their scheduling timezone.
2. Host enables or disables weekdays.
3. Host adds one or more non-empty time windows to enabled days.
4. Host submits the schedule.
5. System authenticates the request again.
6. System validates day values and `HH:mm` time ranges.
7. System verifies that each start time precedes its end time.
8. System persists the timezone and day windows.
9. System revalidates affected scheduling pages.
10. UI confirms that the schedule was saved.

### Alternative flows

#### A1: Multiple windows on one day

Host may configure separated windows, such as `09:00–12:00` and `14:00–17:00`.

#### A2: Day is unavailable

No scheduling candidates are generated for the disabled day.

### Failure flows

- User is unauthenticated.
- Submitted user identity does not match the authenticated user.
- Timezone is invalid.
- Day or time format is invalid.
- Start is not earlier than end.
- Persistence fails.

### Postconditions

#### On success

- The host has one effective recurring configuration for each represented weekday.
- Candidate generation uses the saved timezone context.

#### On failure

- Previously valid availability remains authoritative.

### Authorization

Only the authenticated owner may change their personal availability. Future workspace availability requires a separately defined permission model.

### Idempotency and concurrency

- Submitting the same schedule repeatedly should produce the same effective configuration.
- A single save should not leave a partially updated week.

### Preliminary business rules

- **BR-SCH-001:** A recurring window has `startTime < endTime`.
- **BR-SCH-002:** Disabled days produce no candidates.
- **BR-SCH-003:** A host has at most one effective day configuration per weekday.
- **BR-TIME-002:** Recurring local hours retain the timezone in which they were defined.

---

## UC-SCH-002: Create an event type

**Status:** Current  
**Primary actor:** Host  
**Goal:** Create a reusable direct-booking configuration with a public link

### Trigger

Host submits the create-event-type form.

### Preconditions

- Host is authenticated.
- Host account exists.
- Host has permission to create resources in the owning scope.

### Main success flow

1. Host enters title, slug, duration, optional description, and buffers.
2. System validates field formats and ranges.
3. System normalizes the slug according to the public URL policy.
4. System verifies that the slug is not already used in the owning scope.
5. System creates the active event type.
6. System revalidates the event-type management page.
7. UI displays the new event type and public link.

### Alternative flows

#### A1: Host accepts generated slug

UI derives a slug from the title, but the server still validates it independently.

#### A2: Event type is created before availability

Creation may succeed, but UI must communicate that the booking link is not ready to offer slots.

### Failure flows

- User is unauthenticated.
- Validation fails.
- Slug already exists.
- Concurrent creation claims the same slug after the availability check.
- Persistence fails.

### Postconditions

#### On success

- Event type belongs to exactly one current owning scope.
- Public slug is unique inside that scope.
- Public booking configuration can be retrieved using owner identity and slug.

#### On failure

- No partial event type exists.

### Authorization

The authenticated host is derived from the session. Ownership is not accepted solely from form input.

### Idempotency and concurrency

- Slug uniqueness must be protected by a database constraint.
- Repeated submission is not inherently idempotent unless supplied an idempotency key; duplicate slug protection prevents the most visible duplication.

### Preliminary business rules

- **BR-EVT-001:** Event-type slug is unique within its owning scope.
- **BR-EVT-002:** Duration and buffers remain within supported limits.
- **BR-EVT-003:** Archived event types cannot accept new bookings.

---

## UC-BKG-001: Create a direct booking

**Status:** Current with limitations  
**Primary actor:** Guest  
**Supporting actors:** Host, email provider  
**Goal:** Reserve an available event-type slot exactly once and receive an authoritative result

### Trigger

Guest confirms a selected slot and submits their details.

### Preconditions

- Public event type exists and is active.
- Host exists.
- Submitted event type belongs to the submitted host.
- Requested start is a valid absolute timestamp.
- Guest name, email, and timezone are structurally valid.

### Main success flow

1. System validates the submitted booking input.
2. System loads the event type and host from trusted persistence.
3. System verifies ownership and active status.
4. System calculates end time using the persisted event duration.
5. System checks for overlapping active bookings.
6. System creates a unique calendar UID.
7. System creates the accepted booking.
8. System generates an ICS event.
9. System attempts confirmation-email delivery.
10. System revalidates affected booking and public availability pages.
11. System returns booking success and a separate email-delivery outcome.
12. UI displays authoritative booking confirmation.

### Alternative flows

#### A1: Email delivery fails

- Booking remains successful.
- System records or logs the delivery failure.
- UI explains that the meeting is confirmed but email delivery failed.

#### A2: Host has no email address

ICS generation omits the organizer email rather than inventing one.

#### A3: Guest is authenticated

UI may prefill guest identity, but server validation remains unchanged.

### Failure flows

- Input validation fails.
- Event type or host is missing or inactive.
- Event type does not belong to host.
- Slot overlaps a pending or accepted booking.
- Booking persistence fails.
- A concurrent request books the same slot after the conflict query but before insertion.

The final concurrency case is a documented current limitation requiring a stronger persistence strategy.

### Postconditions

#### On success

- Exactly one accepted booking should represent the reservation.
- Booking start and end are stored as absolute timestamps.
- Calendar UID is unique.
- Email outcome does not change booking truth.
- Slot is excluded from subsequent availability results.

#### On failure before booking creation

- No booking or notification should be created.

#### On notification failure after booking creation

- Booking remains accepted.
- Failure is recoverable independently.

### Authorization

Public booking does not require authentication. The system therefore authorizes the operation through resource validity and applies server-side validation, rate limiting, and abuse controls rather than account membership.

### Idempotency and concurrency

- Proposed: accept a client-generated idempotency key for booking submission.
- Proposed: enforce a durable strategy preventing overlapping active bookings under concurrency.
- Notification retries must reuse the booking and calendar identity.

### Preliminary business rules

- **BR-BKG-001:** Booking event type must belong to the selected host.
- **BR-BKG-002:** Archived event types reject new bookings.
- **BR-BKG-003:** Active bookings for one host must not overlap according to the scheduling policy.
- **BR-BKG-004:** Booking end derives from trusted event-type duration.
- **BR-BKG-005:** A successful booking is independent of notification delivery.
- **BR-NOT-001:** External notification failure does not roll back committed business state.
- **BR-TIME-003:** Scheduled instances are stored as absolute timestamps.

---

## UC-POL-001: Create and publish a poll

**Status:** Partial  
**Primary actor:** Host  
**Goal:** Publish a set of candidate times for participant preference collection

### Trigger

Host submits poll details and candidate times.

### Preconditions

- Host is authenticated.
- Host has permission to create a poll in the owning scope.
- Poll title and candidate input pass structural validation.

### Current success flow

1. Host enters title and optional description.
2. Host selects one date and one or more fixed start hours.
3. System validates the input.
4. System creates a unique slug using normalized title and a random suffix.
5. System converts submitted local-looking values into timestamps.
6. System creates the poll and candidate records together.
7. System redirects host to the public poll URL.

### Target success flow additions

1. Host specifies duration and organizer timezone explicitly.
2. Host may add candidates across several dates.
3. System validates candidate uniqueness, duration, and future constraints.
4. Host configures access, result visibility, participant requirements, and deadline.
5. Poll begins in a defined lifecycle state.
6. Host receives explicit share and invitation actions.

### Alternative flows

#### A1: Save as draft

Poll is stored but cannot receive public responses until published.

#### A2: Generate candidates

System proposes times using scheduling rules; host reviews them before publication.

#### A3: Open-link poll

Participants may respond without prior invitation, subject to abuse controls.

### Failure flows

- User is unauthenticated or unauthorized.
- No candidates are supplied.
- Candidate occurs in the past.
- Candidate timezone cannot be interpreted.
- Candidate times duplicate or overlap contrary to policy.
- Slug collision occurs.
- Poll creation succeeds but candidate creation fails.

The final condition must be prevented with one transaction or nested atomic write.

### Postconditions

#### On success

- Poll and all candidates share one owner and lifecycle.
- Every candidate belongs to the poll.
- Published poll has a resolvable public identifier.
- Organizer timezone and duration are unambiguous in the target model.

#### On failure

- No incomplete published poll remains.

### Authorization

Authenticated identity and owning scope are derived server-side. Future workspace creation requires membership permission.

### Idempotency and concurrency

- Proposed: creation request carries an idempotency key.
- Slug has a durable uniqueness constraint.
- Poll and candidates are created atomically.

### Preliminary business rules

- **BR-POL-001:** A published poll contains at least one candidate.
- **BR-POL-002:** Every candidate belongs to exactly one poll.
- **BR-POL-003:** Poll slug is globally unique under the current URL design.
- **BR-POL-004:** Only draft or open polls may change candidates according to policy.
- **BR-TIME-004:** Poll candidate construction requires explicit organizer timezone context.

---

## UC-POL-002: Submit or revise a poll response

**Status:** Partial  
**Primary actor:** Participant  
**Goal:** Save one coherent set of preferences for the poll

### Trigger

Participant submits preference choices.

### Preconditions

- Poll exists.
- Target behavior: poll is open and before its deadline.
- Participant has access through open-link policy or a valid invitation.
- Submitted candidate IDs belong to the poll.
- Submitted preference values are supported.

### Current success flow

1. Participant enters name and optional email.
2. Participant assigns `YES`, `IF_NEEDED`, or `NO` to candidates.
3. System normalizes participant name.
4. System deletes prior votes matching the same case-insensitive name.
5. System creates the submitted votes in one transaction.
6. UI refreshes and displays updated aggregate results.

### Target success flow

1. System resolves participant identity from invitation or open-link input.
2. System verifies poll state, deadline, access, and candidate membership.
3. Participant explicitly answers required candidates.
4. System upserts one response set for that participant.
5. System records response completion time.
6. UI confirms saved response and provides an edit path while permitted.

### Alternative flows

#### A1: Revise response

Participant replaces their previous preference set while the poll is open.

#### A2: Partial response is allowed

Unanswered candidates are stored or interpreted distinctly from `NO`.

#### A3: Open-link identity

System may issue a private edit token after first submission rather than relying on name alone.

### Failure flows

- Poll is missing, finalized, cancelled, or expired.
- Invitation token is missing, invalid, revoked, or expired.
- Submitted candidate belongs to another poll.
- Duplicate candidate appears in one response.
- Preference value is unsupported.
- Required answers are missing.
- Persistence transaction fails.

### Postconditions

#### On success

- One effective preference exists per participant and candidate.
- All saved candidates belong to the same poll as the participant response.
- Revising replaces effective preferences without duplicating the participant.
- Aggregate results reflect the new effective response.

#### On failure

- Previous complete response remains authoritative.
- No partial replacement is visible.

### Authorization

Private polls authorize through a secret invitation or edit token. Open polls authorize participation through poll policy but still require validation, rate limiting, and abuse protection.

### Idempotency and concurrency

- Repeating the same response should produce the same effective preference set.
- Concurrent revisions from one participant require a defined last-write or version-conflict policy.

### Preliminary business rules

- **BR-POL-005:** Only open polls accept responses.
- **BR-POL-006:** One participant has at most one effective vote per candidate.
- **BR-POL-007:** A vote's participant, candidate, and poll must share the same poll boundary.
- **BR-POL-008:** Unanswered is distinct from `NO`.
- **BR-POL-009:** Finalized, expired, and cancelled polls reject revisions.

---

## UC-POL-003: Finalize a poll into a meeting

**Status:** Proposed  
**Primary actor:** Host  
**Supporting actors:** Participants, notification/calendar processing  
**Goal:** Commit one poll candidate as the authoritative meeting time

### Trigger

Host confirms finalization of a selected candidate, or an approved automatic policy triggers finalization.

### Preconditions

- Poll exists and is open.
- Actor is authorized to finalize the poll.
- Candidate exists and belongs to the poll.
- Poll has not already produced an active meeting.
- Candidate satisfies configured required-participant and conflict policy, or an authorized override is recorded.

### Main success flow

1. System authenticates and authorizes the actor.
2. System loads current poll state, candidate, participants, and effective responses.
3. System recalculates conflicts and recommendation facts using authoritative data.
4. System presents or validates the final decision and any overrides.
5. Within one transaction, system:
   1. verifies poll is still open,
   2. records selected candidate,
   3. creates one meeting and its participants,
   4. marks poll finalized,
   5. records durable notification and calendar work.
6. Transaction commits.
7. System returns the meeting result without waiting for every external provider.
8. Background processing delivers invitations and synchronizes calendars.

### Alternative flows

#### A1: Finalize before everyone responds

Allowed only when the configured decision policy or explicit host override permits it.

#### A2: Select a non-recommended candidate

Host may choose another valid candidate. System stores recommendation facts and optional override reason for auditability.

#### A3: Automatic finalization

Background system acts under a previously configured policy and records that automation initiated the decision.

### Failure flows

- Actor is unauthorized.
- Poll is no longer open.
- Candidate does not belong to poll.
- Candidate became unavailable.
- Required-participant rule fails.
- Another request finalized the poll concurrently.
- Meeting creation or durable work recording fails before commit.
- Email/calendar provider fails after commit.

Provider failure after commit is not a finalization failure.

### Postconditions

#### On success

- Poll is finalized with exactly one selected candidate.
- Poll has at most one active resulting meeting.
- Voting and candidate mutation are locked.
- Meeting participants derive from the poll's participant policy.
- Notification/calendar work is durable and independently retryable.

#### On failure before commit

- Poll remains open.
- No meeting or partial durable work remains.

#### On provider failure after commit

- Poll and meeting remain finalized.
- Provider work records a retryable failure.

### Authorization

Current personal scope: poll owner only. Future workspace scope may allow administrators or explicitly delegated members. Automatic finalization requires an enabled policy established by an authorized actor.

### Idempotency and concurrency

- A poll can produce at most one active meeting.
- Repeated finalization returns the existing result or a stable already-finalized outcome.
- Poll state transition and meeting creation require transactional protection.

### Preliminary business rules

- **BR-POL-010:** Only an open poll may transition to finalized.
- **BR-POL-011:** A finalized poll references exactly one candidate belonging to that poll.
- **BR-POL-012:** A poll produces at most one active resulting meeting.
- **BR-MTG-001:** A meeting records its scheduling source.
- **BR-NOT-002:** Required external work is recorded durably before asynchronous delivery.

---

## UC-MTG-001: Cancel a meeting

**Status:** Proposed  
**Primary actor:** Authorized host, guest, or participant  
**Goal:** End a scheduled commitment and notify affected parties consistently

### Trigger

Authorized actor confirms cancellation.

### Preconditions

- Meeting exists.
- Meeting is in a cancellable state.
- Actor has cancellation permission through identity, membership, or valid management token.

### Main success flow

1. System resolves the actor and authorization method.
2. System loads current meeting state.
3. Actor reviews cancellation impact and optionally provides a reason.
4. System changes meeting state to cancelled.
5. System records cancellation time, actor, and reason.
6. System records durable notification and calendar-cancellation work.
7. System releases internal holds or future availability conflicts according to policy.
8. UI confirms cancellation.
9. Background processing updates participants and provider calendars.

### Alternative flows

#### A1: Already cancelled

System returns the existing cancelled state without creating duplicate work.

#### A2: Guest cancellation

Guest uses a revocable secret management token and may be subject to notice-window policy.

### Failure flows

- Actor is unauthorized.
- Management token is invalid or revoked.
- Meeting is already completed or otherwise non-cancellable.
- State changes concurrently.
- Persistence fails before durable work is recorded.

### Postconditions

#### On success

- Meeting is cancelled exactly once.
- Cancellation audit information is retained.
- Meeting no longer blocks availability according to the cancellation policy.
- Participant update work is durable.

#### On provider failure

- Internal cancellation remains authoritative.
- Provider synchronization is retryable and visibly failed.

### Authorization

Cancellation policy must distinguish host, workspace administrator, authenticated participant, and secret-token guest. Possession of a meeting ID alone is never authorization.

### Idempotency and concurrency

- Repeated cancellation is safe.
- Only one valid state transition wins under concurrent cancellation/reschedule attempts.

### Preliminary business rules

- **BR-MTG-002:** Only meetings in cancellable states may transition to cancelled.
- **BR-MTG-003:** Cancellation records actor and timestamp.
- **BR-MTG-004:** Cancelled meetings do not block future availability according to policy.

---

## UC-MTG-002: Reschedule a meeting directly

**Status:** Proposed  
**Primary actor:** Authorized host, guest, or participant  
**Goal:** Replace the meeting time while preserving one authoritative meeting identity

### Trigger

Authorized actor selects and confirms a replacement time.

### Preconditions

- Meeting exists and is reschedulable.
- Actor has permission to reschedule.
- Replacement time is valid and currently available.
- Meeting version has not changed since the actor began the operation.

### Main success flow

1. System authorizes actor.
2. System calculates valid replacement candidates.
3. Actor selects a replacement.
4. System rechecks conflicts and current meeting version.
5. System updates the meeting's scheduled interval and records history.
6. System records calendar-update and notification work.
7. System returns updated meeting state.
8. Background processing updates the existing provider event identity.

### Alternative flows

#### A1: Host proposes time requiring guest confirmation

Meeting remains at its current time until the guest accepts, or enters an explicit proposed state that does not create two authoritative times.

#### A2: Guest requests reschedule

Policy may require host approval rather than immediate replacement.

### Failure flows

- Actor is unauthorized.
- Meeting is cancelled, completed, or locked.
- Replacement conflicts with another active commitment.
- Meeting changed since candidate selection.
- Provider update fails after internal commit.

### Postconditions

#### On success

- One meeting remains authoritative.
- Previous interval is retained in history.
- Calendar identity is reused where provider protocol permits.
- Participants receive update work.

### Authorization

Permission and approval requirements may differ for host and guest. They must be explicit policy rather than inferred from UI location.

### Idempotency and concurrency

- Meeting version or equivalent optimistic concurrency check prevents lost updates.
- Repeating the same accepted reschedule produces one effective interval change.

### Preliminary business rules

- **BR-MTG-005:** A reschedule retains meeting identity and records previous schedule history.
- **BR-MTG-006:** Replacement time must pass the current conflict policy.
- **BR-MTG-007:** Concurrent updates must not silently overwrite one another.

---

## UC-MTG-003: Reschedule a meeting by consensus

**Status:** Proposed  
**Primary actor:** Host  
**Supporting actors:** Existing meeting participants  
**Goal:** Use a poll to select a replacement time without creating a duplicate active meeting

### Trigger

Host chooses to find a new time with the existing participants.

### Preconditions

- Meeting exists and is reschedulable.
- Host has permission to initiate consensus rescheduling.
- No other active rescheduling process exists for the meeting unless policy permits it.

### Main success flow

1. System copies meeting context, duration, participants, and relevant constraints into a rescheduling poll.
2. Host reviews or generates candidate times.
3. System publishes the poll and invites existing participants.
4. Participants submit preferences.
5. Host or policy finalizes a replacement candidate.
6. System updates the original meeting interval and history.
7. System finalizes the rescheduling poll and links it to the meeting revision.
8. System records notification and calendar-update work.

### Alternative flows

#### A1: No candidate reaches decision criteria

Host adds candidates, extends the deadline, or cancels the rescheduling process. Original meeting remains authoritative unless explicitly cancelled.

#### A2: Original meeting occurs before finalization

System expires the rescheduling process according to policy.

### Failure flows

- Another rescheduling process is active.
- Original meeting is cancelled or changed while poll is open.
- Selected candidate becomes unavailable.
- Poll finalization succeeds but meeting update fails; transaction must prevent this split state.

### Postconditions

#### On success

- Original meeting identity remains authoritative with a new interval.
- Rescheduling poll records its relationship to the meeting revision.
- No duplicate active meeting is created.

#### On abandoned or failed rescheduling

- Original meeting remains unchanged unless separately cancelled.

### Authorization

Only an actor authorized to reschedule the meeting may initiate or finalize its consensus process.

### Idempotency and concurrency

- One active consensus-rescheduling process per meeting is the proposed default.
- Finalization and meeting update are atomic.

### Preliminary business rules

- **BR-MTG-008:** A meeting has at most one active consensus-rescheduling process by default.
- **BR-MTG-009:** Rescheduling poll finalization updates the existing meeting rather than creating a second active commitment.
- **BR-MTG-010:** Abandoning rescheduling does not change the original meeting.

## Cross-cutting rules discovered

These preliminary rules appear across several use cases and will be normalized in the next business-rules document.

### Authorization

- **BR-AUTH-001:** Every mutation revalidates identity or public authorization server-side.
- **BR-AUTH-002:** Resource identifiers prove which record is requested, not who may mutate it.
- **BR-AUTH-003:** Workspace access requires current membership and sufficient role.

### Time

- **BR-TIME-001:** User timezone is a valid IANA identifier.
- **BR-TIME-002:** Recurring local schedules retain their defining timezone.
- **BR-TIME-003:** Scheduled instances are stored as absolute timestamps.
- **BR-TIME-004:** Poll candidate construction has explicit timezone context.

### Notifications and integrations

- **BR-NOT-001:** External delivery failure does not roll back committed business state.
- **BR-NOT-002:** Required asynchronous work is recorded durably before delivery.
- **BR-NOT-003:** Retried provider operations reuse stable internal and provider identities.

### Reliability

- **BR-REL-001:** Public creation operations require abuse controls appropriate to their risk.
- **BR-REL-002:** Retried commands must not create duplicate business outcomes.
- **BR-REL-003:** Multi-record lifecycle transitions are atomic where partial state would be invalid.

## Open decisions exposed by the use cases

1. Does direct booking create a `Booking` that is itself the scheduled commitment, or does it create a separate `Meeting`?
2. Does onboarding create a personal workspace immediately?
3. Are open-link and invitation-only polls both supported?
4. How is participant identity represented for accountless users?
5. What is the exact lifecycle state machine for polls and meetings?
6. Which database strategy prevents overlapping active bookings under concurrency?
7. Which actors may cancel or reschedule, and how are accountless actors authorized?
8. Is meeting history modeled as revisions, lifecycle events, or audit records?
9. What durable-job mechanism will support notification and calendar work?
10. When can an automatic finalization policy act on behalf of a host?

These decisions must be addressed before the proposed ER model is treated as accepted.

## Next documentation step

Create `business-rules.md` to:

1. Remove duplicate preliminary rules.
2. Give each rule one authoritative definition.
3. Classify rules as current, target, or unresolved.
4. Connect rules to use cases and future tests.
5. Identify which rules require database constraints versus application enforcement.

The current ER diagram can then be documented accurately, followed by a proposed model tested against these use cases and rules.

