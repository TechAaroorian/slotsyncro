
# SlotSyncro 🗓️

> A modern, serverless group scheduling platform and availability heatmap builder built with **Next.js (App Router)**, **TypeScript**, **Turborepo**, and **Neon PostgreSQL**.

[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](https://techaaroorian.github.io/slotsyncro/)

---

## 🚀 Live Interactive Test Coverage Report

The unit test suite achieves full coverage using **Vitest** and **happy-dom**. The interactive HTML coverage report is automatically updated and deployed via GitHub Actions on every push to `main`:

👉 **[View Live Coverage Report](https://techaaroorian.github.io/slotsyncro/)**

*(Note: Replace `YOUR_GITHUB_USERNAME` in the links with your actual GitHub username)*

---

## 🏗️ Monorepo Architecture

This project is structured as a **Turborepo** workspace using `pnpm`:

```text
slotsyncro/
├── apps/
│   └── app/               # Main Next.js App Router application
├── packages/
│   ├── db/                # Prisma ORM schema, client export, and DB scripts (@repo/db)
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── .github/
│   └── workflows/
│       └── coverage.yml   # CI/CD test coverage & GitHub Pages deploy workflow
├── package.json           # Root pnpm workspace scripts
└── pnpm-workspace.yaml

```

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, React Server Components & Server Actions)
* **Language:** TypeScript
* **Monorepo Tools:** Turborepo & `pnpm` Workspaces
* **Database & ORM:** Neon Serverless PostgreSQL with Prisma v7 (`@repo/db`)
* **Authentication:** Auth.js (NextAuth v5) with GitHub OAuth & JWT sessions
* **Testing:** Vitest, happy-dom, V8 Coverage
* **CI/CD:** GitHub Actions (PR Coverage Reporter & GitHub Pages Deployment)
* **Styling:** Tailwind CSS

---

## 💻 Getting Started

### Prerequisites

* **Node.js:** v20+
* **Package Manager:** `pnpm` v9+

### Environment & Setup

1. **Clone the repository:**

```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/slotsyncro.git](https://github.com/YOUR_GITHUB_USERNAME/slotsyncro.git)
cd slotsyncro

```

1. **Install workspace dependencies:**

```bash
pnpm install

```

1. **Configure Environment Variables:**
Set up your environment variables for local development:

* Copy `packages/db/.env.example` to `packages/db/.env` (Set `DATABASE_URL` for Neon DB).
* Copy `apps/app/.env.example` to `apps/app/.env.local` (Set `AUTH_SECRET`, OAuth credentials, etc.).

1. **Generate Prisma Client:**

```bash
pnpm --filter @repo/db db:generate

```

1. **Run the Development Server:**

```bash
pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & CI/CD Pipeline

Run the unit test suite across workspace packages with code coverage analysis:

```bash
# Run coverage across the frontend application
pnpm --filter app test:coverage

# Run all workspace test suites via Turborepo
pnpm test

```

### CI/CD Workflow

* **Pull Requests:** GitHub Actions runs `vitest run --coverage`, generates Prisma client artifacts with a CI connection fallback, and posts a line-by-line coverage breakdown as a PR comment.
* **Main Branch:** Automatically builds and deploys the generated Vitest HTML report to **GitHub Pages**.

---

## 🔒 Project Status & Licensing

This repository is maintained primarily as a personal product and portfolio showcase.

* **Contributions & Pull Requests:** External contributions, pull requests, and feature submissions are **not being accepted** at this time. Unsolicited PRs will be closed without merging.
* **License:** **All Rights Reserved.** You are welcome to inspect and review the source code for educational and evaluation purposes. Copying, redistribution, hosting, or commercial usage is strictly prohibited without explicit permission.
