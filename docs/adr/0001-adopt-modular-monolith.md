# ADR 0001: Adopt a Modular Monolith for the Product Application

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision owners:** SlotSyncro maintainers

## Context

SlotSyncro currently combines several closely related business capabilities in one Next.js application:

- Identity and authentication
- Event types
- Recurring availability
- Direct booking
- Group polling
- Email and calendar invitations

The proposed product direction adds meetings, poll finalization, participants, notifications, calendar integrations, workspace permissions, and timezone-fair recommendations. These capabilities need clear ownership, but they also share data and participate in business operations that benefit from a single database transaction.

The current code is primarily grouped by technical type (`app/actions`, `components`, and `lib`). That organization is understandable at the current size, but it can make domain boundaries less visible as product behavior grows. Large Server Actions could otherwise accumulate validation, authorization, persistence, notification, and provider-specific behavior.

SlotSyncro is also a portfolio project. Its architecture should demonstrate how a product can grow without introducing operational complexity that the current requirements do not justify.

## Decision

The scheduling product in `apps/app` will evolve as a **modular monolith**.

This means:

- The product remains one deployable Next.js application.
- Product modules run in the same process.
- Modules use typed function calls rather than internal network requests.
- The application uses one PostgreSQL database and one Prisma client configuration.
- Each domain concept has one logical owning module.
- Cross-module access occurs through a small public module API where practical.
- Core business-state changes use local database transactions.
- Slow external side effects are separated from committed business state and should become durable jobs when background processing is introduced.

The initial target module map is:

```text
Identity
Workspace (proposed)
Scheduling Configuration
Availability
Direct Booking
Polling
Meetings (proposed)
Notifications
Integrations
```

Physical reorganization will be incremental. Accepting this ADR does not authorize a repository-wide folder move.

## Module responsibilities

| Module | Responsibility |
| --- | --- |
| Identity | Users, OAuth accounts, sessions, onboarding, and profile timezone |
| Workspace | Proposed personal/team tenancy, memberships, roles, and invitations |
| Scheduling | Event types, duration, buffers, and reusable booking rules |
| Availability | Working windows, slot generation, and conflict inputs |
| Booking | Guest reservation workflow and direct-booking rules |
| Polling | Poll lifecycle, candidates, participants, votes, and recommendation inputs |
| Meetings | Proposed finalized scheduled commitment shared by booking and poll outcomes |
| Notifications | Templates, notification intent, delivery state, attempts, and reminders |
| Integrations | Resend, calendar providers, conferencing providers, and provider-specific adapters |

## Dependency principles

1. Next.js routes and Server Actions are delivery adapters, not the sole location of business rules.
2. UI components call application operations; they do not access Prisma directly.
3. A module does not mutate another module's owned records through scattered queries when an owning operation exists.
4. Provider-specific response types do not become domain contracts.
5. Shared code is not automatically domain code; generic utilities remain small and intentional.
6. Circular module dependencies are design feedback and must be resolved rather than hidden with re-export chains.

## Cross-module interaction

Use a direct typed call when the caller requires an immediate result:

```text
Polling.finalizePoll()
    -> Meetings.createFromPoll()
```

Use an application/domain event for secondary reactions:

```text
MeetingScheduled
    -> Notifications records invitation work
    -> Calendar integration records synchronization work
```

In-process events alone are not considered reliable delivery. Operations that must survive process termination will eventually use a database-backed job or outbox mechanism.

## Transaction principle

Commit internal business truth before performing slow external work.

Example poll-finalization boundary:

```text
Database transaction
    - verify ownership and OPEN status
    - select candidate
    - finalize poll
    - create meeting
    - record notification/calendar work

After commit
    - deliver email
    - synchronize external calendar
```

External delivery failure must not roll back a business decision that was already committed successfully.

## Initial physical structure

Modules may begin with a lightweight structure:

```text
apps/app/modules/
├── booking/
│   ├── actions/
│   ├── components/
│   ├── queries/
│   ├── schemas/
│   ├── services/
│   └── tests/
├── polling/
├── meetings/
└── notifications/
```

Not every module must contain every directory. Additional `domain`, `application`, or `infrastructure` layers are introduced only when their separation resolves real complexity.

Generic UI primitives remain in `apps/app/components/ui`. Next.js routes remain in `apps/app/app` and compose module APIs.

## Migration strategy

1. Document use cases and domain ownership before moving files.
2. Use the poll-to-meeting lifecycle as the first intentionally modular vertical slice.
3. Move existing code when it is changed for a feature, rather than performing a large mechanical migration.
4. Add import-boundary lint rules after stable public module APIs exist.
5. Extract framework-independent code to `packages/domain` only when reuse or isolation provides measurable value.

## Alternatives considered

### Continue organizing only by technical type

This is simple initially, but domain behavior can become distributed across actions, components, schemas, and utilities without an obvious owner.

### Microservices

Rejected for the current product. Separate services would introduce network contracts, distributed tracing, deployment coordination, retry behavior, and distributed consistency without a demonstrated scaling or team-autonomy requirement.

### One workspace package per domain

Rejected as the starting structure. Package boundaries add tooling and dependency-management overhead and can create the appearance of separation without improving runtime or domain ownership. Packages remain an extraction option for stable, framework-independent capabilities.

## Consequences

### Positive

- Domain ownership becomes visible.
- Business logic can be tested without rendering pages.
- One database supports strong local transactions.
- Deployment and local development remain simple.
- Modules can be extracted later if evidence justifies it.
- The repository demonstrates scalable design without artificial distributed systems.

### Costs and risks

- TypeScript folders alone do not enforce boundaries.
- Developers must resist direct cross-module Prisma access.
- Poorly designed shared modules can become dependency dumping grounds.
- Incremental migration temporarily leaves both old and new organization patterns.
- Module APIs and ownership require documentation discipline.

## Validation

This decision is successful when:

- New use cases have an identifiable owning module.
- Server Actions remain thin coordination adapters.
- Cross-module dependencies are explicit and acyclic.
- Core lifecycle operations have documented transaction boundaries.
- External provider failures are represented separately from internal business state.
- The application remains deployable and testable as one unit.

## Revisit conditions

Revisit this ADR only when evidence shows that a module requires independent deployment, scaling, data ownership, reliability isolation, or team autonomy. Repository size or feature count alone is not sufficient justification for microservices.

