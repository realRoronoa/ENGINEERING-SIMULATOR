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
- `packages/database/migrations.test.ts` (7 tests passing)
- `packages/database/src/learner.test.ts` (5 tests passing - skill state queries, Bayesian upserts, evidence logging)
- `packages/database/src/viva.test.ts` (5 tests passing - viva session creation, answer logging, and completion)
- `packages/database/src/hints.test.ts` (5 tests passing - hint event logging, ladder fetching, AI call audit logging)
- `packages/evaluator/src/evaluator.test.ts` (5 tests passing)
- `packages/learner-model/src/mastery.test.ts` (9 tests passing - Bayesian mastery, bounds, evidence updates, misconception frequency, confidence estimation)
- `packages/selector/src/selector.test.ts` (16 tests passing - prerequisite filtering, priority ranker, ~70% difficulty targeting, recency exclusion, misconception remediation, fallback)
- `packages/ai/src/ai.test.ts` (9 tests passing - fact sheet grounding, Socratic mentor inquiries, prohibition safeguards against hidden tests and solution leaks, simulated fallback)
- `reference-systems/shopverse/tests/api.test.ts` (5 tests passing)
- `reference-systems/shopverse/tests/hidden/orderAtomicity.test.ts` (3 tests passing - fault injection & fix validation)
- `apps/api/src/app.test.ts` (69 tests passing - health, ready probe, auth, session creation, next task selection, attempt retrieval, patch submission 202, submission polling, E2E pipeline, viva start/answers/completion, attempt abandonment, hint ladder progression with exhaustion bounds, AI mentor grounding with prohibition guards, transfer task assignment & evaluation, onboarding 201/400/409, diagnostic 200/400/404/403/409 with Bayesian skill profiling, and profile skills & evidence inspection)
- `apps/cli/src/cli.test.ts` (15 tests passing - config/device token storage, workspace tracking with `.engsim.json`, init workspace scaffolding, test command local validation, submit command with patch and diff resolution, status inspection, result evaluation polling/formatting, full Commander registry, ApiClient HTTP authorization, and live Express v5 API server integration)
- `apps/worker/src/worker.test.ts` (10 tests passing - patch validation, test evaluation, evidence events, DB persistence & Bayesian skill update, transfer task grading with completion transition, queue batch draining, lifecycle)
- `apps/web/src/App.test.tsx` (2 tests passing - header and headline renders)
- `apps/web/src/features/mission-demo/missionDemoMachine.test.ts` (3 tests passing - state machine transitions)
- `apps/web/src/features/demo/demo.test.tsx` (5 tests passing - demo mode, preloaded dashboard, mission consistency, safe recovery)
- Total: 175 unit/integration tests passing cleanly in Vitest across 17 test suites.

### Existing deployment state

Local development mode (`npm run dev:api`, `npm run dev:web`). Production build outputs verified (`dist/` for web, api, cli, contracts, and all packages).

### Current blockers

None.

### Immediate next milestone

Phase 17 — Content Catalog Seeding & Multi-Skill Variant Expansion (authoring active skills, templates, variants in DB migrations / seeds per `CONTENT_AUTHORING.md`).
