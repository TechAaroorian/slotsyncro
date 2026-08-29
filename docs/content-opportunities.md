# Content Opportunities

**Document status:** Active backlog

This backlog captures educational content that naturally emerges while designing and building SlotSyncro. An item is not a publishing commitment. It becomes ready only after the related design or implementation has enough evidence, diagrams, code, or results to teach honestly.

## Selection criteria

A topic is worth publishing when it has at least two of these qualities:

- Solves a real engineering or product problem
- Contains a non-obvious trade-off
- Produces a reusable mental model
- Has a visual explanation or demonstrable result
- Includes a mistake, correction, or measurable improvement
- Connects product reasoning to implementation

Avoid content that only announces that a library was installed.

## Content funnel

One substantial piece of work can produce several formats:

```text
Design/implementation work
  -> long-form article or YouTube video
  -> LinkedIn architecture summary
  -> X thread
  -> Short/Reel with one insight
```

Each adaptation should be native to its format rather than an identical copy.

## Current high-value topics

### 1. Why a booking can succeed when its confirmation email fails

**Source work:** Resilient booking and Resend integration.

Core lesson:

> Database truth and notification delivery are different outcomes.

Possible formats:

- **Article:** “Your Email Failed, but the Booking Succeeded: Modeling Partial Failure in Server Actions”
- **YouTube:** Implement and test the failure boundary in Next.js
- **Short/Reel:** “Never put your database write and email send behind one success message”
- **LinkedIn/X:** Before-and-after action result types and the retry bug they prevent

Readiness: **Ready after adding a small sequence diagram and sanitised code excerpts.**

### 2. Turborepo versus Turbopack

Core lesson:

> Turborepo orchestrates repository tasks; Turbopack compiles a Next.js application.

Possible formats:

- **Article:** “Turborepo and Turbopack Are Not the Same Thing”
- **YouTube:** Walk through the SlotSyncro task and dependency graph
- **Short/Reel:** A 30-second visual distinction
- **LinkedIn/X:** One diagram showing both tools in the same repository

Readiness: **Ready after repository architecture review.**

### 3. Why a poll feature still felt disconnected

Core lesson:

> A feature is not a complete product journey until it reaches a meaningful user outcome.

Use the transition:

```text
Create -> vote -> heatmap -> dead end
```

versus:

```text
Create -> vote -> recommend -> finalize -> invite -> manage
```

Possible formats:

- **Article:** Product thinking for developers building portfolio projects
- **YouTube:** UX and architecture audit of a scheduling application
- **Short/Reel:** “Your feature works, but does the journey finish?”
- **LinkedIn/X:** A before/after user-journey diagram

Readiness: **Ready for an outline; the current and target journeys are now documented.**

### 4. Designing timezone fairness for distributed teams

Core lesson:

> The most popular time is not always the fairest time.

Possible formats:

- **Article:** Scoring consensus, hard conflicts, and timezone inconvenience
- **YouTube series:** From requirements to algorithm to tests
- **Short/Reel:** Compare majority score with fairness score
- **LinkedIn/X:** Explainable recommendation card

Readiness: **Future—publish after the fairness rules and test cases exist.**

### 5. From UI screens to an ER model

Core lesson:

> Design tables from business rules and access patterns, not directly from forms.

Possible formats:

- **Article:** Model booking, poll, participant, vote, and meeting entities
- **YouTube:** Live ER-design workshop with normalization and constraints
- **Short/Reel:** “A form field is not automatically a database column”
- **LinkedIn/X:** The modeling sequence from user problem to index

Readiness: **After current and proposed ER diagrams are reviewed.**

### 6. Introducing workspaces without overwhelming individual users

Core lesson:

> A personal workspace can establish a future-ready tenancy boundary while remaining invisible in the initial UX.

Possible formats:

- **Article:** Evolving user-owned data into workspace-owned multi-tenant data
- **YouTube:** Membership modeling, roles, and migration strategy
- **Short/Reel:** Why `organizationId` directly on `User` is often too restrictive
- **LinkedIn/X:** User-to-workspace many-to-many ER diagram

Readiness: **After tenancy use cases and ER design are complete.**

### 7. A modular monolith in Next.js without pretending it is microservices

Core lesson:

> Repository workspaces, business modules, and deployable services are three different boundaries.

Possible formats:

- **Article:** Structuring a growing Next.js application with explicit domain ownership
- **YouTube:** Refactor one poll-to-meeting vertical slice into modules
- **Short/Reel:** “Scalable architecture does not mean starting with microservices”
- **LinkedIn/X:** Turborepo versus modular monolith versus microservices diagram

Readiness: **Architecture decision is ready; implementation content should wait for the first modular vertical slice.**

### 8. Business rules are not validation code

Core lesson:

> A business invariant can require coordinated enforcement across validation, a database constraint, a transaction, and tests.

Possible formats:

- **Article:** From business rule to database constraint and test strategy
- **YouTube:** Audit which rules a real schema enforces and which it only appears to enforce
- **Short/Reel:** “Your Zod schema is not your domain model”
- **LinkedIn:** Compare UI validation, application policy, and database invariants
- **X:** Keep the post general—for example, explain why a pre-insert uniqueness query still needs a unique constraint

Readiness: **Ready for an outline; implementation examples should follow the ER and constraint review.**

### 9. Reading an ER diagram as a set of guarantees

Core lesson:

> An ER diagram is valuable when it explains cardinality, optionality, ownership, and integrity—not merely table boxes connected by lines.

Possible formats:

- **Article:** Audit an existing relational schema before redesigning it
- **YouTube:** Trace keys, cascades, normalization trade-offs, and missing invariants
- **Short/Reel:** “A foreign key proves existence, not authorization”
- **LinkedIn:** How redundant foreign keys can create valid-looking but contradictory rows
- **X:** Keep examples generic, such as explaining why two valid foreign keys can still form an invalid combination

Readiness: **Ready for an outline; proposed-model comparison will strengthen the long-form version.**

### 10. Separate the scheduled commitment from how it was created

Core lesson:

> Several workflows can produce the same business outcome without forcing their source-specific fields into one table.

Possible formats:

- **Article:** Model a shared aggregate produced by multiple workflows
- **YouTube:** Compare one nullable universal table with a core outcome plus source records
- **Short/Reel:** “The workflow that creates a record is not always the record itself”
- **LinkedIn:** Explain provenance versus current business state
- **X:** Keep it general: distinguish an order from the checkout session, a shipment from its purchase flow, or a meeting from its scheduling method

Readiness: **Ready for an outline; DD-001 and DD-002 are accepted and represented in the proposed ER model.**

### 11. Design the migration before writing the target schema

Core lesson:

> A proposed ER diagram is incomplete until every current entity has a destination and risky data has a validation strategy.

Possible formats:

- **Article:** Current schema to target model without a clean-slate rewrite
- **YouTube:** Walk through additive migration, backfill, cutover, constraints, and legacy removal
- **Short/Reel:** “Your target schema is the easy part; preserving existing truth is the design”
- **LinkedIn:** Seven-phase migration map from user-owned scheduling data to meeting/workspace aggregates
- **X:** Keep it general: explain why migrations need data-quality reports before stricter constraints

Readiness: **Ready for an outline; implementation evidence should wait for the first migration phase.**

### 12. Commit business truth before calling external systems

Core lesson:

> A successful database transaction and a successful email or calendar request are different outcomes with different recovery strategies.

Possible formats:

- **Article:** Design reliable side effects in a modular monolith without premature microservices
- **YouTube:** Trace booking confirmation from transaction to durable notification attempt
- **Short/Reel:** “An email timeout should not unbook a confirmed meeting”
- **LinkedIn:** Compare network calls inside a transaction with durable post-commit work
- **X:** Keep it general: “Commit business truth first. Record the work it requires in the same transaction. Let retryable workers handle unreliable networks.”

Readiness: **Architecture explanation is ready; implementation evidence should follow the first durable notification slice.**

### 13. Authentication is identity; authorization is a resource decision

Core lesson:

> Knowing who made a request does not prove they can modify the referenced record.

Possible formats:

- **Article:** Model authenticated, guest-token, and system actors in one application
- **YouTube:** Threat-model a public booking and invitation-only poll flow
- **Short/Reel:** “A valid session is not ownership”
- **LinkedIn:** Explain why authorization belongs inside the use case, not only in UI visibility
- **X:** Keep it general: “Authentication answers who you are. Authorization answers whether you may perform this operation on this resource—using its current state.”

Readiness: **Ready for an outline; token implementation should be demonstrated only after security tests exist.**

### 14. A production architecture is a set of recovery guarantees

Core lesson:

> A deployment diagram is incomplete if it shows where software runs but not how changes, failures, backups, and retries are handled.

Possible formats:

- **Article:** Turn a monorepo architecture diagram into a production readiness plan
- **YouTube:** Design environments, migrations, workers, observability, and recovery for a small product
- **Short/Reel:** “A backup you have never restored is an assumption”
- **LinkedIn:** Explain why RTO, RPO, migration compatibility, and durable work belong in architecture documentation
- **X:** Keep it general: “Production-ready is not a cloud-provider logo. It is knowing how you deploy, detect failure, preserve data, retry work, and recover.”

Readiness: **Documentation lesson is ready; operational claims should wait until a deployment and restore exercise exist.**

### 15. Choose a platform without coupling the domain to it

Core lesson:

> Platform-native delivery can reduce operations while ports, durable state, and explicit boundaries preserve the option to move specialized workloads later.

Possible formats:

- **Article:** Deploy a modular monolith to a serverless platform without making the domain serverless-specific
- **YouTube:** Map two monorepo applications to independent deployments and shared infrastructure
- **Short/Reel:** “Using a platform is not the same as putting it inside your business logic”
- **LinkedIn:** Explain the difference between accepting a host and delegating every architecture decision to it
- **X:** Keep it general: “Portability does not require avoiding platform features. Keep business truth portable; isolate platform triggers and adapters at the edges.”

Readiness: **ADR and architecture explanation are ready; deployment walkthrough should wait for an actual preview release.**

### 16. A roadmap should sequence risk, not just features

Core lesson:

> The most useful engineering roadmap connects user outcomes to data migrations, decision gates, failure risks, and proof of completion.

Possible formats:

- **Article:** Turn product documentation into a vertical architecture roadmap
- **YouTube:** Prioritize a scheduling product from UX coherence through transactions and recovery
- **Short/Reel:** “A milestone is not done because the table exists”
- **LinkedIn:** Compare a feature checklist with outcome, risk, dependency, and evidence-driven milestones
- **X:** Keep it general: “Sequence roadmaps by irreversible risk: clarify the user outcome, settle invariants, plan migration, prove concurrency, then add integrations.”

Readiness: **Ready from the documentation case study; implementation retrospectives can strengthen it later.**

## Publishing record template

When an idea is selected, add:

```text
Working title:
Audience:
Problem:
Key lesson:
Evidence/demo:
Article angle:
YouTube angle:
Short/Reel hook:
LinkedIn/X angle:
Status:
Published URLs:
```

## Editorial principles

- Teach from implemented evidence or clearly label proposals.
- Never expose secrets, tokens, personal data, or production identifiers.
- Prefer explaining one trade-off well over listing many technologies.
- Show failed approaches when they provide a useful lesson.
- Credit external sources and libraries.
- Do not manufacture performance claims without measurements.
- Keep portfolio content connected to the actual repository history.
- Keep X posts application-agnostic: publish the general engineering principle rather than a project update.
- Use articles and YouTube for project-backed case studies when implementation evidence improves the lesson.

