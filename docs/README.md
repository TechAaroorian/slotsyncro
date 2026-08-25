# SlotSyncro Design Documentation

This directory is the maintained source of truth for SlotSyncro's product and technical design. It describes both the software that exists today and the direction being evaluated for the product.

SlotSyncro started as a portfolio project inspired by scheduling products such as Calendly and Doodle. Its proposed product direction is a timezone-aware scheduling and group-decision platform that supports direct booking and fairness-based consensus scheduling.

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
| User journeys | End-to-end direct-booking and group-scheduling journeys | Planned |
| Use cases | Actors, permissions, preconditions, alternative flows, and failures | Planned |
| Domain model | Current and proposed ER models, invariants, and lifecycle states | Planned |
| System architecture | Runtime components, integrations, security boundaries, and sequences | Planned |
| Deployment architecture | Environments, domains, infrastructure, and operational concerns | Planned |
| Roadmap | Vertical delivery milestones and dependencies | Planned |
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

## Existing historical context

The root `PROJECT_CONTEXT.md` contains useful project history, but it also includes old status information and earlier directory names. Until its remaining useful content is migrated, treat it as historical context rather than the maintained design specification.

