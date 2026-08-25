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

Readiness: **Ready after user journeys are documented.**

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

