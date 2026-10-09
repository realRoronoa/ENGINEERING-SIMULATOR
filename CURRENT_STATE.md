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
- **Backend Shell (`apps/api`):** Fastify + Zod with `/health` endpoint returning typed `HealthResponse`.
- **Frontend Shell (`apps/web`):** React + Vite + React Router shell with production build. Currently implementing a complete **Demo Mode** experience populated with a deterministic fixture ("Alex Morgan"), navigable without a backend.

### Existing database and migrations

None. PostgreSQL is configured as the planned database (`DATABASE.md`, `.env.example`, `packages/database/README.md`).

### Existing tests and their last verified results

- `packages/contracts/src/index.test.ts` (2 tests passing)
- `apps/api/src/app.test.ts` (1 test passing - `/health` endpoint)
- `apps/web/src/App.test.tsx` (1 test passing - React component shell render)
- Total: 4 unit/integration tests passing cleanly in Vitest.

### Existing deployment state

Local development mode (`npm run dev:api`, `npm run dev:web`). Production build outputs verified (`dist/` for web, api, and contracts).

### Current blockers

None for foundation setup.

### Immediate next milestone

Milestone 1 — Database schema setup (`packages/database`) & Reference system integration (`reference-systems/shopverse`).
