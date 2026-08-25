# Monorepo, Turborepo, Modular Monolith, and Microservices: What Actually Changes?

A Turborepo can contain multiple applications under `apps/`. If those applications can be built and deployed separately, does that mean the system uses microservices?

Not necessarily. Multiple applications in one repository tell us how the source code is organized. Microservices are defined by runtime and operational boundaries.

Consider this small structure:

```text
platform/
├── apps/
│   ├── marketing/
│   └── app/
└── packages/
    └── db/
```

Is this a monorepo, a modular monolith, or a microservices system?

It is clearly a monorepo. It might contain a modular-monolith application. The tree alone, however, cannot prove that any microservices exist.

While formalizing the architecture of SlotSyncro, a portfolio application, I wanted to sharpen how I distinguished these familiar concepts. They are often discussed together, even though each describes a different layer of a system. Placing them at their correct layers turns a broad understanding into a more precise architectural model.

## Four concepts at four different layers

Here is the central distinction:

| Concept | What it describes | Primary question |
| --- | --- | --- |
| Monorepo | Repository organization | Where does the code live? |
| Turborepo | Task orchestration | How are builds, tests, and other tasks coordinated? |
| Modular monolith | Internal application design | How is one deployable application divided? |
| Microservices | Runtime architecture | How are services deployed, scaled, and connected? |

Turbopack is related by name, but it solves another problem:

```text
Repository organization → Monorepo
Task orchestration      → Turborepo
Application structure   → Modular monolith
Runtime architecture    → Microservices
Compilation             → Turbopack
```

Turborepo coordinates tasks across workspaces. Turbopack compiles a Next.js application. These concepts do not occupy the same architectural layer, so they are not direct alternatives.

That is why questions such as “Should I use a monorepo or microservices?” are difficult to answer as stated. A team can use both, either, or neither.

## What makes SlotSyncro a monorepo?

A **monorepo** is one repository that contains multiple related projects. Those projects might be applications, shared libraries, configuration packages, or services. They share Git history and can be changed together, but they can still have separate dependencies, scripts, and release processes.

SlotSyncro currently has this workspace structure:

```text
slotsyncro/
├── apps/
│   ├── marketing/    # Public marketing website
│   └── app/          # Scheduling product
├── packages/
│   └── db/           # Prisma and database infrastructure
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

The examples in this article are based on SlotSyncro, a scheduling product I am creating as a portfolio application. The repository is publicly viewable as a practical implementation reference: [SlotSyncro](https://github.com/TechAaroorian/slotsyncro).

This is a monorepo because multiple identifiable projects live in one Git repository. The applications and database package have their own `package.json` files, while pnpm workspaces connect them. A change to the product and its database package can be reviewed and committed together.

A **workspace** is one project recognized and managed by the repository's package manager. In this example, `apps/app`, `apps/marketing`, and `packages/db` are separate pnpm workspaces. Each can define its own package name, dependencies, and commands, while using another local workspace as a dependency without publishing it to a package registry.

The monorepo label does not tell us how many production processes exist. It does not mean every folder is independently deployed, every application is a microservice, or every shared file needs its own package.

Turborepo is not required either. A repository can be a monorepo using only pnpm, npm, or Yarn workspaces. Turborepo is an additional task runner, not the feature that makes it a monorepo.

## What Turborepo actually does

In this repository, the tools sit roughly in this order:

```text
Git repository
      ↓
pnpm workspaces
      ↓
Turborepo
      ↓
Next.js, Prisma, Vitest, and other workspace tools
```

The root commands delegate work across the repository. Typical Turborepo commands look like this:

```bash
turbo run build
turbo run test
turbo run lint
```

Turborepo understands workspace dependencies, schedules tasks in the right order, caches successful outputs, avoids repeated work, and can filter execution to selected workspaces. In SlotSyncro, for example, the build graph accounts for database-client generation before dependent application builds.

None of this provides service-to-service communication. Turborepo does not create API gateways, message queues, independent databases, distributed transactions, container orchestration, or production scaling rules.

Turborepo knows that one workspace depends on another. It does not decide whether those workspaces become separate production services.

Next.js then uses Turbopack for its own compilation work. The similar names can make the tools sound interchangeable, but their scopes are different: Turborepo sees the repository task graph; Turbopack sees a Next.js application and its module graph.

## A modular monolith inside a monorepo

Now move one level inward, from the repository to `apps/app`.

A **modular monolith** is one deployable application organized into distinct business modules. The modules have defined responsibilities and controlled ways to interact, but they still run in the same application process rather than communicating as separate network services. It keeps the operational simplicity of a monolith while making internal ownership and dependencies clearer.

SlotSyncro’s current product code is still mainly grouped by technical concerns such as routes, actions, components, and utilities. The accepted direction is to evolve it incrementally into business modules. A possible target shape is:

```text
apps/app/
├── app/                       # Next.js routes
└── modules/                   # Proposed structure
    ├── identity/
    ├── availability/
    ├── booking/
    ├── polling/
    ├── meetings/
    └── notifications/
```

These would be business modules, not microservices. They would have clear responsibilities and controlled interfaces, but run inside the same Next.js application, deploy together, and use one PostgreSQL database.

The runtime remains simple:

```text
Monorepo
├── Marketing application
└── Scheduling application ───────── one deployment boundary
    ├── Identity module
    ├── Availability module
    ├── Booking module
    ├── Polling module
    └── Notifications module
                 ↓
             PostgreSQL
```

The boundaries are architectural, but they are not network boundaries. A booking operation can call availability logic as a typed function and update related state in one local database transaction.

That is the useful middle ground of a modular monolith: explicit ownership without immediately accepting the operational cost of a distributed system. A monolith is not synonymous with unstructured legacy code. It can have deliberate, well-tested internal boundaries.

## Folder names are not module boundaries

A booking module might eventually use a small internal structure like this:

```text
modules/booking/
├── domain/
│   ├── booking.ts
│   └── booking-rules.ts
├── application/
│   ├── create-booking.ts
│   └── cancel-booking.ts
├── infrastructure/
│   └── booking-repository.ts
├── ui/
│   └── booking-form.tsx
└── index.ts
```

The exact folders matter less than the ownership they express. The module’s `index.ts` can act as its public API:

```ts
import { createBooking } from "@/modules/booking";
```

Code outside the module should avoid reaching through that API into implementation details:

```ts
// Avoid reaching into another module's internals.
import { bookingRepository } from
  "@/modules/booking/infrastructure/booking-repository";
```

Folders help people see the intended boundary, but they do not enforce it. Public APIs, code review, dependency rules, and tests make the boundary real. Modular-monolith architecture depends more on enforced boundaries than on folder names.

## Why multiple applications still do not mean microservices

Return to the original two applications:

```text
apps/
├── marketing/
└── app/
```

`marketing` presents public product information. `app` owns authentication, availability, bookings, polls, and other scheduling workflows. They are different user-facing surfaces, and the repository can build them independently.

That still says nothing about the product’s internal business capabilities being independently operated services. Its booking, polling, and notification concerns currently belong to the same product application. No internal network call is required merely because the repository contains two Next.js apps.

> “Multiple applications” is a repository observation. “Microservices” is a runtime conclusion.

Even independent deployment of the marketing and product sites would not make either one a microservice architecture. They may simply be two deployable web applications with different purposes.

## What would actually create microservices?

Imagine the repository later changed to this:

```text
platform/
├── apps/
│   ├── marketing/
│   ├── web/
│   ├── scheduling-service/
│   ├── billing-service/
│   ├── notification-service/
│   └── background-worker/
└── packages/
    ├── contracts/
    ├── observability/
    └── config/
```

The names suggest microservices, but the folders still do not prove it. These components become services through meaningful operational independence: they run as separate processes, deploy and scale independently, communicate through APIs or messages, isolate at least some failures, and have intentionally defined business and data ownership.

A simplified runtime might look like this:

```text
┌─────────────────────┐
│   Web application   │  Deployment A
└──────────┬──────────┘
           │ HTTPS
┌──────────▼──────────┐
│ Scheduling service │  Deployment B
└──────────┬──────────┘
           │ MeetingScheduled event
┌──────────▼──────────┐
│Notification service│  Deployment C
└─────────────────────┘
```

Now the boundaries are also network and deployment boundaries. That creates capabilities such as independent scaling and release ownership, but it also introduces timeouts, retries, message delivery, distributed tracing, versioned contracts, and consistency decisions.

The trade-off is easier to see side by side:

| Modular monolith | Microservices |
| --- | --- |
| Modules call one another in-process | Services communicate over a network or queue |
| Usually deployed together | Independently deployable |
| Easier cross-module transactions | Distributed consistency must be handled |
| One primary runtime unit | Multiple runtime units |
| Lower operational complexity | Higher operational complexity |
| Boundaries enforced in code | Boundaries also enforced by the network |

Independent deployment is important, but it is not the whole definition. If several processes must always release together, share unclear data ownership, and cannot fail independently, the system may be a distributed monolith instead.

Microservices are not the inevitable final stage of a successful modular monolith. For SlotSyncro’s current scale and requirements, local calls and transactions are valuable, while independent service operation has not earned its cost.

## Turborepo supports either runtime architecture

Turborepo can coordinate a modular-monolith repository:

```text
apps/marketing
apps/app
packages/db
packages/ui       # possible future extraction
```

It can also coordinate a repository containing services:

```text
apps/web
apps/scheduling-service
apps/notification-service
apps/worker
packages/contracts
```

In both cases, it can run the complete build or target a workspace:

```bash
turbo run build
turbo run build --filter=scheduling-service
```

The second repository may use microservices because of how those applications run, communicate, and deploy—not because Turborepo launched their build tasks. Turborepo can manage a repository containing microservices, but it does not turn applications into microservices.

A monorepo can therefore contain a marketing application, a modular-monolith product, and several genuine services at the same time. Repository boundaries and runtime boundaries do not need to match one-to-one.

## Keep dependency direction clear

One general monorepo rule prevents a great deal of confusion:

```text
Applications may import packages.
Packages must not import applications.

Good: apps/app → packages/db
Bad:  packages/db → apps/app
```

If `packages/db` imports application authentication code, the dependency becomes circular:

```text
apps/app → packages/db → apps/app
```

The package is no longer reusable infrastructure; it secretly depends on one consumer. Ownership becomes unclear, and isolated testing becomes harder.

For example, database infrastructure should not retrieve application-specific session context:

```ts
// Bad: packages/db knows about an application's authentication.
import { getCurrentUser } from "../../apps/app/auth";
```

Instead, the package can expose an operation with explicit input:

```ts
// packages/db
export function findBookings(userId: string) {
  return db.booking.findMany({ where: { userId } });
}
```

The application supplies the context it owns:

```ts
// apps/app
const user = await getCurrentUser();
const bookings = await findBookings(user.id);
```

This principle applies to monorepos generally. Turborepo can understand a dependency graph, but it cannot decide whether that graph represents sensible ownership.

## When should a module become a package?

Once developers see a `packages/` directory, it is tempting to move every cleanly named capability into it. That usually creates boundaries before there is evidence for them.

| Application module | Shared package |
| --- | --- |
| Belongs to one application | Lives outside a specific application |
| Represents a product capability | Provides a reusable capability |
| May depend on application conventions | Should expose a stable interface |
| Usually has one consumer | Often has multiple consumers |
| Deploys with its application | May be consumed by several applications |

For example, SlotSyncro should begin with booking behavior close to its only consumer:

```text
apps/app/modules/booking/
```

It should not create `packages/booking` merely to make the repository tree look more sophisticated. Keeping code inside its only consumer is not poor architecture. It is often the clearest expression of ownership.

Possible future extractions include:

```text
packages/
├── domain/    # Framework-independent scheduling rules
├── email/     # Shared templates or rendering infrastructure
└── ui/        # Components genuinely shared by both applications
```

These are proposals, not current SlotSyncro workspaces. `packages/domain` becomes useful if scheduling calculations need to run in the product, a worker, and isolated tests. `packages/email` becomes useful after multiple notification workflows need common rendering. `packages/ui` becomes useful when the marketing and product applications actually share a maintained design system.

## A practical extraction test

A package should have at least one strong justification, and preferably more than one.

### More than one consumer

Two applications or runtimes need the same capability. Reuse is real, not predicted from one similar-looking component.

### Framework-independent domain value

Scheduling calculations can run without React, Next.js, Prisma, or a provider SDK. That isolation makes the code easier to reuse and reason about.

### Stable inputs and outputs

The capability exposes a small, intentional API instead of importing application internals. If its interface changes with every feature, extraction may be premature.

### Independent testing value

Its behavior can be tested meaningfully without starting the complete application. This is especially useful for scheduling, timezone, or consensus rules.

### Different build or deployment concerns

Database generation, email rendering, shared contracts, or worker code may need distinct tasks. A workspace boundary can make those workflows explicit.

Do not extract code merely because `packages/` makes the repository look more sophisticated. Extraction should clarify ownership or enable a real workflow.

## A decision framework

When the terminology starts to blur, I return to these questions:

```text
Do multiple related projects need to live together?
→ Consider a monorepo.

Do you need caching and coordinated workspace tasks?
→ Consider Turborepo.

Does one deployable application need stronger internal boundaries?
→ Use a modular monolith.

Does one capability require independent deployment, scaling,
failure isolation, data ownership, or team autonomy?
→ Consider extracting a service.

Is some code used by only one application?
→ Keep it close to that application for now.
```

This sequence avoids using a runtime solution for a repository problem—or creating a network boundary when a code boundary is enough.

**Repository note:** SlotSyncro is a public portfolio and reference repository, not an open-source project or starter template. Some modules and packages discussed in this article are architectural proposals and do not exist in the current implementation.

## The complete mental model

A monorepo organizes where code lives.

A modular monolith organizes boundaries inside one application.

Microservices define independently operated runtime boundaries.

Turborepo coordinates tasks across the repository.

Turbopack compiles a Next.js application.

The number of folders under `apps/` does not determine the runtime architecture. Deployment, communication, scaling, and ownership boundaries do.

---

**Suggested description:** Multiple applications in a Turborepo do not automatically create microservices. Here is how monorepos, modular monoliths, runtime boundaries, Turborepo, and Turbopack actually fit together.

**Suggested tags:** `#webdev` `#architecture` `#monorepo` `#turborepo`
