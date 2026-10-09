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
- `packages/database/src/learner.test.ts` (5 tests passing - skill state queries, Bayesian upserts, evidence logging)
- `packages/evaluator/src/evaluator.test.ts` (5 tests passing)
- `packages/learner-model/src/mastery.test.ts` (8 tests passing - Bayesian mastery, bounds, evidence updates, misconception frequency)
- `packages/selector/src/selector.test.ts` (16 tests passing - prerequisite filtering, priority ranker, ~70% difficulty targeting, recency exclusion, misconception remediation, fallback)
- `reference-systems/shopverse/tests/api.test.ts` (5 tests passing)
- `reference-systems/shopverse/tests/hidden/orderAtomicity.test.ts` (3 tests passing - fault injection & fix validation)
- `apps/api/src/app.test.ts` (23 tests passing - health, ready probe, auth, session creation, next task selection, attempt retrieval, patch submission 202, submission polling, E2E pipeline)
- `apps/cli/src/cli.test.ts` (5 tests passing - config, init workspace, patch submit, commander registry)
- `apps/worker/src/worker.test.ts` (9 tests passing - patch validation, test evaluation, evidence events, DB persistence & Bayesian skill update, queue batch draining, lifecycle)
- `apps/web/src/App.test.tsx` (1 test passing - React component shell render)
- Total: 89 unit/integration tests passing cleanly in Vitest across 12 test suites.

### Existing deployment state

Local development mode (`npm run dev:api`, `npm run dev:web`). Production build outputs verified (`dist/` for web, api, and contracts).

### Current blockers

None.

### Immediate next milestone

Phase 12 — Viva Oral Verification Scaffold (`POST /v1/attempts/:id/viva`).

Milestone 1 — Database schema setup (`packages/database`) & Reference system integration (`reference-systems/shopverse`).
