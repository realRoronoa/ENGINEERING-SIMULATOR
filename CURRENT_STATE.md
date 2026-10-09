# CURRENT STATE

> **What is true RIGHT NOW.**
> Not what we are building ([`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)).
> Not how much is built ([`PROJECT_STATUS.md`](./PROJECT_STATUS.md)).

**As of:** 2026-10-09

### Current repository state

The repository is an operational TypeScript ESM monorepo using npm workspaces with initial runnable applications (`apps/api`, `apps/web`) and a shared contract package (`packages/contracts`).

### Current development phase

Phase 1 — Technical Monorepo Foundation & Core Scaffolding.

### Actual technology configuration

- **Runtime & Language:** Node.js LTS, ESM modules, TypeScript strict (`tsconfig.base.json`).
- **Monorepo Workspaces:** `apps/*`, `packages/*`.
- **Backend Shell (`apps/api`):** Express + Zod with `/health`, `/health/ready` (DB ping), `POST /v1/sessions`, `GET /v1/attempts/:id`, Bearer JWT auth middleware, and contract-compliant error handling.
- **Frontend Shell (`apps/web`):** React + Vite + React Router shell with production build.
- **Contracts Package (`packages/contracts`):** Exported TypeScript interfaces (`Submission`, `EvaluationResult`, `EvaluationStatus`, `HealthResponse`).
- **Database Package (`packages/database`):** PostgreSQL client connection pool, TypeScript models, 5 complete migration sets, and typed CRUD query helpers (`sessions`, `attempts`).
- **Evaluator Package (`packages/evaluator`):** Deterministic grading engine with unified diff validation, path security constraints, and test execution result summarization.
- **Learner Model Package (`packages/learner-model`):** Evidence-weighted Bayesian updates, beta-distribution confidence bounds, streak tracking, and misconception hit frequency analysis.
- **Selector Engine Package (`packages/selector`):** Rule-based task selection (ADR-005) with prerequisite DAG validation, priority ranker, ~70% predicted success rate difficulty targeting, recency filtering, and graceful fallback.
- **Quality Tooling:** Vitest, ESLint (TypeScript flat config), Prettier (`.prettierrc.json`), `.editorconfig`, `.env.example`.

### Existing executable applications

- `apps/api` (Express HTTP server shell)
- `apps/web` (React/Vite frontend shell)
- `apps/cli` (Learner CLI tool `engsim` with login, init, submit, and status commands)
- `reference-systems/shopverse` (Reference e-commerce backend API, schema, Dockerfile & docker-compose)

### Existing database and migrations

5 migration scripts authored in `packages/database/migrations/`:

- `20261009_000001_authored_knowledge.sql`
- `20261009_000002_generated_content.sql`
- `20261009_000003_learner_state.sql`
- `20261009_000004_activity.sql`
- `20261009_000005_operations.sql`

Shopverse standalone reference schema and seeds in `reference-systems/shopverse/src/db/`.

### Existing tests and their last verified results

- `packages/contracts/src/index.test.ts` (2 tests passing)
- `packages/database/src/migrations.test.ts` (7 tests passing)
- `packages/evaluator/src/evaluator.test.ts` (5 tests passing)
- `packages/learner-model/src/mastery.test.ts` (8 tests passing - Bayesian mastery, bounds, evidence updates, misconception frequency)
- `packages/selector/src/selector.test.ts` (16 tests passing - prerequisite filtering, priority ranker, ~70% difficulty targeting, recency exclusion, misconception remediation, fallback)
- `reference-systems/shopverse/tests/api.test.ts` (5 tests passing)
- `reference-systems/shopverse/tests/hidden/orderAtomicity.test.ts` (3 tests passing - fault injection & fix validation)
- `apps/api/src/app.test.ts` (10 tests passing - health, ready probe, auth, session creation, attempt retrieval)
- `apps/cli/src/cli.test.ts` (5 tests passing - config, init workspace, patch submit, commander registry)
- `apps/web/src/App.test.tsx` (1 test passing - React component shell render)
- Total: 62 unit/integration tests passing cleanly in Vitest across 10 test suites.

### Existing deployment state

Local development mode (`npm run dev:api`, `npm run dev:web`). Production build outputs verified (`dist/` for web, api, and contracts).

### Current blockers

None for foundation setup.

### Immediate next milestone

Milestone 1 — Database schema setup (`packages/database`) & Reference system integration (`reference-systems/shopverse`).
