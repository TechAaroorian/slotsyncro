# ADR 0002: Deploy the Next.js Applications on Vercel

- **Status:** Accepted
- **Date:** 2026-08-29
- **Decision owners:** SlotSyncro maintainers

## Context

SlotSyncro is a Turborepo containing two Next.js applications:

- `apps/marketing`, the public marketing and educational surface
- `apps/app`, the scheduling product, Server Actions, route handlers, authentication, and public booking/poll experiences

The applications should deploy independently while remaining in one repository. The deployment platform should support Next.js and Turborepo without requiring the project to operate container orchestration or custom application servers at its current stage.

The product application also needs preview deployments, environment-specific configuration, OAuth callback URLs, provider webhooks, and server-side connectivity to managed PostgreSQL. Future notification, reminder, and calendar work requires durable asynchronous execution, but the exact worker mechanism has not yet been selected.

## Decision

Deploy both Next.js applications on Vercel as separate Vercel projects connected to the same Git repository:

| Application | Vercel project root | Proposed production domain |
| --- | --- | --- |
| Marketing | `apps/marketing` | `slotsyncro.com` |
| Product | `apps/app` | `app.slotsyncro.com` |

`packages/db` remains a shared workspace package consumed during build and at product runtime. It is not an independently deployed service.

Managed PostgreSQL remains external to the application runtime. The current implementation uses Neon-compatible Prisma infrastructure. The database and product-function regions should be located close together where the selected plans permit region configuration.

Vercel will initially own:

- Next.js builds and application runtime
- Preview and production deployments
- Custom-domain routing and managed TLS
- Environment-scoped runtime configuration
- Product route-handler execution, including verified webhooks

Vercel is not granted authority over internal domain truth. PostgreSQL remains authoritative for meetings, polls, notification intent, attempts, and integration state.

## Background-work boundary

This decision does not select Vercel Cron, Vercel Queues, or Vercel Workflow as the final durable-work mechanism.

The application architecture must preserve portability:

```text
Use case
  -> commit business state and durable work intent
  -> worker/dispatcher claims work
  -> provider adapter performs delivery
```

Vercel Cron does not automatically retry a failed invocation and plan-specific scheduling limits affect its suitability for prompt delivery. Vercel Queues offers durable at-least-once delivery and retries but is currently documented as Beta. These mechanisms should be evaluated when durable notification delivery is implemented.

Regardless of the trigger, consumers must remain idempotent and notification/provider attempts must be persisted independently of meeting state.

## Configuration consequences

- Marketing and product receive separate environment-variable sets.
- Marketing does not receive database, authentication, email, or calendar credentials without a reviewed use case.
- Preview and production use separate OAuth/provider configuration where callbacks or data isolation require it.
- Canonical URLs, cookies, OAuth callbacks, email links, and webhook registrations must agree with the environment's product domain.
- Secret values remain in Vercel environment configuration or an approved secret manager, never in repository files.

## Build consequences

- Each application is configured as a separate project with its own root directory.
- Builds may use Turborepo filtering so unrelated applications can skip deployment work.
- Prisma Client generation remains an upstream build requirement for the product application.
- Production database migrations run as a controlled, serialized release step rather than from every application instance at startup.
- Preview deployment success does not authorize preview code to use production data or provider credentials.

## Alternatives considered

### Self-managed virtual machine

This provides maximum runtime control and supports long-lived workers, but requires operating reverse proxies, TLS, deploy automation, process supervision, scaling, and patching. That operational burden is not justified for the current application.

### Container platform

Platforms that run containers offer portability and straightforward long-running workers. They remain a future option, but introduce image, registry, networking, health, and scaling configuration before SlotSyncro has demonstrated those requirements.

### Single Vercel project for both applications

Rejected because the applications have different domains, release concerns, environment-variable needs, and runtime responsibilities. Separate projects make those boundaries visible while preserving one repository.

### Different frontend and product hosts

Possible, but it adds deployment-system inconsistency without a current need. A single platform is simpler while both surfaces use Next.js.

## Consequences

### Positive

- Strong alignment with the current Next.js and Turborepo stack
- Independent marketing and product deployments
- Preview deployments that support portfolio review and change validation
- Low initial infrastructure-management overhead
- Managed scaling and TLS
- A clear path from repository boundaries to deployment boundaries

### Costs and risks

- Function execution and scheduled-work constraints influence background processing
- Usage-based pricing must be monitored as traffic grows
- Platform-specific configuration can increase switching cost
- Preview OAuth and provider callback configuration requires care
- Durable background-work products may change maturity or pricing
- Long-running or infrastructure-specialized workloads may later require another runtime

## Portability rules

To limit unnecessary platform coupling:

1. Keep business rules independent of Vercel APIs.
2. Put Vercel request/trigger handling in delivery or infrastructure adapters.
3. Persist business state and work intent in PostgreSQL before provider delivery.
4. Keep provider consumers idempotent and callable through narrow interfaces.
5. Avoid treating ephemeral filesystem or process memory as durable state.
6. Record any deeper Vercel-specific commitment in a separate ADR.

## Validation

The decision is successful when:

- Both applications deploy independently from the monorepo.
- A change isolated to one application can avoid unnecessary work for the other.
- Preview environments cannot mutate production data.
- Product runtime can connect safely to PostgreSQL without exhausting connections.
- OAuth, public links, and verified webhooks use correct environment URLs.
- A failed email/calendar provider call does not undo committed meeting state.
- Deployment and provider usage are observable enough to identify cost or reliability risks.

## Revisit conditions

Revisit the hosting decision when measured evidence shows a need for:

- Long-lived or specialized compute not suited to the selected Vercel runtime
- More precise or higher-volume background processing than the selected mechanism supports
- Infrastructure controls, data residency, or networking unavailable on the selected plan
- Cost behavior that is materially worse than a suitable alternative
- Independent reliability or scaling requirements for a module

The existence of more features alone is not a reason to migrate.

## References

- [Vercel monorepo documentation](https://vercel.com/docs/monorepos)
- [Deploying Turborepo to Vercel](https://vercel.com/docs/monorepos/turborepo)
- [Vercel Fluid Compute](https://vercel.com/docs/fluid-compute)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Vercel Queues](https://vercel.com/docs/queues)
