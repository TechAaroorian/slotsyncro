# Feature Inventory

**Document status:** Initial draft  
**Last reviewed against repository:** 2026-08-31

This inventory separates implemented behavior from proposals. It is not a marketing feature list.

## Status definitions

| Status | Definition |
| --- | --- |
| Current | The primary flow is implemented and usable. |
| Partial | Supporting implementation exists, but important user, security, or lifecycle work remains. |
| Proposed | Intended next-generation design, not yet implemented. |
| Exploratory | Possible future direction requiring validation. |

## Authentication and identity

| Capability | Status | Notes |
| --- | --- | --- |
| GitHub OAuth authentication | Current | Implemented with Auth.js. First OAuth login also acts as account creation. |
| Protected dashboard pages | Current | Availability, event types, and bookings verify the authenticated session. |
| New-user onboarding | Proposed | Username, timezone, initial availability, and first scheduling action. |
| Google OAuth authentication | Partial | The Auth.js provider is configured, but the custom sign-in UI and local environment currently expose only GitHub; identity scopes must remain separate from future Google Calendar permissions. |
| Email magic-link login | Exploratory | A possible alternative for users without supported OAuth providers. |
| Password authentication | Out of scope | Adds password storage, reset, verification, and abuse-prevention responsibilities without current product value. |
| Personal workspace | Proposed | Created automatically for each user without exposing unnecessary organization UI. |
| Team workspaces and membership | Proposed | Required before shared team resources, roles, and administration. |

## Direct scheduling

| Capability | Status | Notes |
| --- | --- | --- |
| Event-type creation | Current | Includes title, slug, duration, description, and buffers. |
| Event-type activation and deletion | Current | Managed from event-type cards. |
| Public booking link | Current | Guest selects an available date and time. |
| Guest detail collection | Current | Name, email, and optional notes with client and server validation. |
| Recurring weekly availability | Current | Supports multiple windows per day and a host timezone. |
| Slot generation across timezones | Current | Converts host availability to guest-local display and removes conflicting SlotSyncro bookings. |
| Event-type buffers in public slot calculation | Partial | Buffer fields exist, but the public booking view currently passes zero to the slot generator. |
| Double-booking protection | Partial | A conflict query exists, but check and insert are not protected by a database-level exclusion rule or equivalent atomic strategy. |
| Booking dashboard | Partial | Lists upcoming bookings but lacks detail, cancellation, rescheduling, and accurate host-timezone presentation. |
| Meeting cancellation | Proposed | Requires lifecycle, authorization, notification, and calendar-update rules. |
| Meeting rescheduling | Proposed | Direct selection and consensus-based rescheduling are both candidates. |
| Multiple durations per event type | Exploratory | Useful after the core lifecycle is complete. |

## Email and calendar invitations

| Capability | Status | Notes |
| --- | --- | --- |
| Guest confirmation email | Current | Implemented with React Email and Resend in the reconciled baseline. |
| ICS attachment | Current | Stable booking UID and attachment generation are implemented in the reconciled baseline. |
| Guest-timezone email formatting | Current | Confirmation times are formatted in the guest's submitted timezone. |
| Separate booking and email outcomes | Current | Booking success is reported independently from the email result; durable delivery state remains proposed. |
| Persisted notification status | Proposed | Needed for delivery history, retries, and operational visibility. |
| Retry failed notification | Proposed | Must include authorization, idempotency, and abuse controls. |
| Host notification | Proposed | Host should receive or configure booking notifications. |
| Reminder and follow-up workflows | Proposed | Requires background-job scheduling and template management. |
| Cancellation/reschedule ICS updates | Proposed | Must reuse the event UID and emit the correct calendar sequence/status. |

## Group scheduling polls

| Capability | Status | Notes |
| --- | --- | --- |
| Poll creation | Partial | Supports one date and fixed one-hour candidates from 09:00 to 17:00. |
| Public poll link | Current | Anyone with the slug can view and vote. |
| Three-state preference | Current | `YES`, `IF_NEEDED`, and `NO`. |
| Vote replacement | Partial | Previous votes are replaced by participant name; identity and cross-slot validation require stronger modeling. |
| Availability heatmap | Current | Displays preference counts and a weighted score. |
| Poll management dashboard | Proposed | List, status, response progress, share, close, finalize, and archive actions. |
| Poll lifecycle states | Proposed | Draft, open, finalized, expired, and cancelled. |
| Multiple dates and variable duration | Proposed | Required for practical group scheduling. |
| Explicit organizer timezone | Proposed | Current poll timestamps depend on runtime timezone interpretation. |
| Participant invitations | Proposed | Tokenized invitations, response state, reminders, and optional open-link mode. |
| Required and optional participants | Proposed | Recommendation rules should distinguish required attendance. |
| Poll finalization into meeting | Proposed | The most important missing connection in the current product. |
| Lock voting after finalization | Proposed | Must follow a defined poll state machine. |
| Participant-suggested candidates | Exploratory | Organizer approval should prevent uncontrolled candidate changes. |

## Fair scheduling differentiation

| Capability | Status | Notes |
| --- | --- | --- |
| Weighted consensus score | Partial | Current calculation is preference-based and does not model required attendees or timezone burden. |
| Explainable recommendation | Proposed | Show why one candidate ranks above another. |
| Timezone inconvenience score | Proposed | Measure candidates against participant working-hour preferences. |
| Rotating timezone burden | Proposed | Distribute inconvenient recurring-meeting times more evenly over time. |
| Quorum and role rules | Exploratory | Useful for committees, interview panels, and structured groups. |
| Automatic finalization policy | Proposed | Finalize when configured response and availability conditions are met. |
| Temporary candidate holds | Proposed | Prevent proposed times from being consumed while voting remains open. |
| Smart candidate generation | Proposed | Generate candidates from duration, calendars, availability, buffers, and fairness rules. |

## Integrations and platform capabilities

| Capability | Status | Notes |
| --- | --- | --- |
| Prisma/PostgreSQL persistence | Current | Shared through the `@repo/db` workspace package. |
| External calendar free/busy | Proposed | Google Calendar is a likely first provider. |
| Calendar event creation | Proposed | Separate from login consent and coordinated with internal meeting state. |
| Video-conference link integration | Proposed | Use an external provider rather than build video infrastructure. |
| Workspaces and roles | Proposed | Owner, administrator, and member permissions. |
| Workspace invitations | Proposed | Token lifecycle, expiration, acceptance, and audit rules required. |
| Public API and webhooks | Exploratory | Valuable after internal lifecycle events become stable. |
| Embeddable scheduler | Exploratory | Useful integration surface after the core flow is mature. |
| Audit logging | Proposed | Especially important for workspace administration and automatic finalization. |

## UX and navigation

| Capability | Status | Notes |
| --- | --- | --- |
| Localized routing | Partial | English, Spanish, and German routing exists, but several links and redirects do not preserve locale. |
| Theme switching | Current | Light/dark theme support exists. |
| Unified scheduling navigation | Proposed | Event types and polls should live within one authenticated scheduling area. |
| Dashboard overview | Proposed | Current header references a dashboard route that does not exist. |
| Poll vote confirmation | Proposed | Current success behavior refreshes the page without a clear completion state. |
| Consistent empty and error states | Partial | Implemented in some areas but not governed by shared patterns. |
| Accessibility review | Proposed | Include keyboard, focus, semantic status, contrast, and screen-reader testing. |

## Technical and quality capabilities

| Capability | Status | Notes |
| --- | --- | --- |
| Turborepo task orchestration | Current | Root tasks coordinate development, builds, linting, and database generation. |
| Turbopack compilation | Current | Next.js 16 uses Turbopack by default for the two Next.js applications. |
| Modular-monolith architecture | Proposed | Direction is accepted; physical business-module boundaries will be introduced incrementally during vertical feature work. |
| Unit and component testing | Current | Vitest and Testing Library are configured. |
| Coverage reporting | Current | CI publishes a coverage report. |
| End-to-end tests | Proposed | Prioritize direct booking and poll-to-meeting journeys. |
| Background-job infrastructure | Proposed | Required for deadlines, reminders, retries, and automatic finalization. |
| Observability | Proposed | Structured logs, error tracking, delivery metrics, and job visibility. |
| Rate limiting and abuse prevention | Proposed | Required for public booking, polling, invitations, and notification retries. |

## Highest-priority gaps

1. Connect polls to a finalized meeting outcome.
2. Give polls a dashboard, ownership controls, and lifecycle states.
3. Make poll candidate creation multi-date and timezone-safe.
4. Correct navigation and locale consistency.
5. Define the future relationship among booking, poll, meeting, participant, and workspace before changing the schema.

