# SlotSyncro Design Documentation

This directory is the maintained source of truth for SlotSyncro's product and technical design. It describes both the software that exists today and the direction being evaluated for the product.

SlotSyncro started as a portfolio project inspired by scheduling products such as Calendly and Doodle. Its proposed product direction is a timezone-aware scheduling and group-decision platform that supports direct booking and fairness-based consensus scheduling.

The core design-documentation baseline is complete as of 2026-08-29. Proposed-model and architecture checklists describe implementation evidence still to be produced; they do not mean the documentation itself is missing.

## How to read these documents

The documentation uses the following status labels:

| Label | Meaning |
| --- | --- |
| **Current** | Implemented in the repository and available in the product. |
| **Partial** | Some supporting code exists, but the user journey is incomplete or has known limitations. |
| **Proposed** | A reviewed design direction that has not been implemented. |
| **Exploratory** | An idea worth evaluating; it is not yet a product commitment. |
| **Out of scope** | Deliberately excluded from the current roadmap. |

Statements about current behavior should be verifiable in code. Proposed behavior must not be presented as shipped functionality.

## Documentation map

| Document | Purpose | Status |
| --- | --- | --- |
| [Product overview](./product-overview.md) | Vision, users, problems, positioning, principles, and boundaries | Initial draft |
| [Feature inventory](./feature-inventory.md) | Current, partial, proposed, and later capabilities | Initial draft |
| [Repository architecture](./repository-architecture.md) | Turborepo structure, application boundaries, dependency rules, and package strategy | Initial draft |
| [ADR 0001: Modular monolith](./adr/0001-adopt-modular-monolith.md) | Accepted decision for structuring the product application as business modules | Accepted |
| [ADR 0002: Vercel deployment](./adr/0002-deploy-nextjs-applications-on-vercel.md) | Accepted host and project boundaries for the two Next.js applications | Accepted |
| [User journeys](./user-journeys.md) | Actors, current experience, target outcomes, and cross-journey requirements | Initial draft |
| [Use cases](./use-cases.md) | Preconditions, authorization, success, failures, postconditions, and preliminary rules | Initial draft |
| [Business rules](./business-rules.md) | Authoritative invariants, current enforcement, target rules, and test implications | Initial draft |
| [Current domain model](./domain-model-current.md) | Existing Prisma entities, ER diagram, keys, cardinality, constraints, indexes, and integrity gaps | Current-state analysis |
| [Proposed domain decisions](./domain-decisions.md) | Accepted modeling choices, trade-offs, and explicitly unresolved mechanisms | Accepted directions |
| [Proposed domain model](./domain-model-proposed.md) | Target entities, ER diagrams, lifecycle states, constraints, transactions, and migration path | Proposed logical design |
| [System architecture](./system-architecture.md) | Modular runtime boundaries, request and transaction flows, durable work, integrations, security, and sequences | Proposed runtime design |
| [Deployment architecture](./deployment-architecture.md) | Environments, deployable units, database, releases, secrets, observability, backups, and recovery | Proposed deployment design |
| [Roadmap](./roadmap.md) | Vertical delivery milestones, dependencies, decision gates, and completion evidence | Proposed delivery plan |
| [Content opportunities](./content-opportunities.md) | Reusable learning and publishing ideas discovered during development | Active backlog |

## Articles

- [Monorepo, Turborepo, Modular Monolith, and Microservices: What Actually Changes?](./articles/monorepo-turborepo-modular-monolith-microservices.md)

## Documentation workflow

For a new capability, work in this order:

```text
User problem
  -> Use case
  -> Business rules
  -> Domain concepts
  -> Data model and constraints
  -> System design
  -> Implementation plan
  -> Code and tests
```

This order prevents UI screens or database tables from becoming the product specification by accident.

## Writing conventions

Each design document should:

- State whether it describes current or proposed behavior.
- Explain why a decision is useful, not only what was selected.
- Record important alternatives and trade-offs.
- Define domain terms consistently.
- Include failure and authorization paths, not only the happy path.
- Prefer small Mermaid diagrams where relationships are easier to understand visually.
- Link to source files when documenting current implementation details.
- Avoid secrets, real user data, credentials, and production identifiers.

## Decision records

Major architectural choices will be recorded in `docs/adr/` using Architecture Decision Records. An ADR is appropriate when a decision:

- Changes a long-lived system boundary.
- Is expensive to reverse.
- Affects multiple applications or packages.
- Selects one meaningful alternative over another.
- Establishes a security, tenancy, or data-model rule.

Small implementation details do not require ADRs.

Accepted decisions:

- [ADR 0001: Adopt a modular monolith for the product application](./adr/0001-adopt-modular-monolith.md)
- [ADR 0002: Deploy the Next.js applications on Vercel](./adr/0002-deploy-nextjs-applications-on-vercel.md)

## Existing historical context

The root `PROJECT_CONTEXT.md` contains useful project history, but it also includes old status information and earlier directory names. Until its remaining useful content is migrated, treat it as historical context rather than the maintained design specification.

