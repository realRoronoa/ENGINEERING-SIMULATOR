# Development Guide

## Prerequisites

| Tool              | Version | Notes                                       |
| ----------------- | ------- | ------------------------------------------- |
| Node.js           | 20+     | LTS recommended                             |
| pnpm              | 8+      | Package manager                             |
| Docker            | 24+     | Required for grading worker and local infra |
| Docker Compose    | v2+     | Bundled with Docker Desktop                 |
| PostgreSQL client | 16      | `psql` for direct DB access                 |

---

## Initial Setup

```bash
# 1. Clone
git clone <repo-url>
cd engineering-simulator

# 2. Install dependencies (all packages)
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your local values

# 4. Start infrastructure (Postgres, Redis)
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# 5. Run all migrations
pnpm --filter @eng-sim/database migrate

# 6. Seed initial content and reference data
pnpm --filter @eng-sim/database seed

# 7. Start the API server (dev mode with hot reload)
pnpm --filter @eng-sim/api dev

# 8. Start the web app (separate terminal)
pnpm --filter @eng-sim/web dev
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eng_sim_dev

# Supabase Auth (obtain from Supabase project)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (OpenAI)
OPENAI_API_KEY=

# Queue
QUEUE_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/eng_sim_dev

# App
API_PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Feature flags
FEATURE_VIVA=true
FEATURE_TRANSFER=false
```

---

## Running Individual Packages

```bash
# API only
pnpm --filter @eng-sim/api dev

# Web only
pnpm --filter @eng-sim/web dev

# Grading worker
pnpm --filter @eng-sim/worker dev

# CLI (link for local use)
pnpm --filter @eng-sim/cli link
engsim --help

# Run tests for a package
pnpm --filter @eng-sim/evaluator test

# Run all tests
pnpm test
```

---

## Database Migrations

```bash
# Create a new migration
pnpm --filter @eng-sim/database migration:create <name>

# Run pending migrations
pnpm --filter @eng-sim/database migrate

# Rollback last migration
pnpm --filter @eng-sim/database migrate:rollback

# Reset (dev only)
pnpm --filter @eng-sim/database reset
```

Migration files: `packages/database/migrations/`

**Rule:** Never modify an existing migration. Always add a new one.

---

## Content Scripts

```bash
# Validate all content (skills, templates, variants)
pnpm --filter @eng-sim/content validate

# Import skills into database
pnpm run scripts:content:import-skills

# Check variant health
pnpm run scripts:content:check-variants
```

---

## Definition of Done

A feature is **complete** only when ALL of the following are true:

1. **Code exists** — feature is implemented
2. **Tests exist** — unit + integration tests pass
3. **API contract updated** — if the endpoint signature changed, `API_CONTRACT.md` is updated
4. **Database migration exists** — if schema changed, migration file is present and tested
5. **Documentation exists** — README or doc file reflects the change
6. **Error states handled** — expected failure modes return correct error responses
7. **Security boundaries respected** — learners cannot access other learners' data
8. **Logs/metrics appropriate** — key actions emit structured logs; no sensitive data in logs
9. **No forbidden data collected** — see `PRIVACY.md`
10. **Feature connected to correct module** — no logic placed in the wrong layer
11. **PR reviewed** — approved by area owner

---

## Code Style

- **TypeScript strict mode** — all packages use `"strict": true`
- **No `any`** — use `unknown` where type is truly unknown
- **Explicit return types** on all exported functions
- **ESLint + Prettier** — enforced in CI
- **No commented-out code** in PRs

```bash
# Lint all
pnpm lint

# Format all
pnpm format

# Type-check all
pnpm type-check
```

---

## Testing Strategy

See [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md) for full detail.

| Package                  | Test Type                   |
| ------------------------ | --------------------------- |
| `packages/evaluator`     | Unit + integration (Docker) |
| `packages/selector`      | Unit (deterministic logic)  |
| `packages/learner-model` | Unit (mastery math)         |
| `packages/ai`            | Unit with mocked LLM        |
| `packages/content`       | Validation scripts          |
| `apps/api`               | Integration (real DB)       |
| `apps/web`               | Component tests             |
| `apps/cli`               | E2E tests                   |

---

## Folder Conventions

```
src/
├── index.ts          # Package entry point (exports only)
├── types.ts          # Internal types (do not export from index if in contracts)
├── <feature>/
│   ├── index.ts
│   ├── <feature>.ts
│   └── <feature>.test.ts
```

---

## Adding a New Endpoint

1. Define or update types in `packages/contracts/api/`
2. Add route handler in `apps/api/src/routes/`
3. Add validation schema
4. Add service logic
5. Write integration test
6. Update `API_CONTRACT.md`

---

## Adding a New Database Table

1. Create migration in `packages/database/migrations/`
2. Update schema docs in `packages/database/schema/`
3. Update `DATABASE.md`
4. Add DB access function in `packages/database/src/`
5. Review with Developer 3 (Database owner)

---

## Working With Contracts

Contracts in `packages/contracts/` define the shared language between all developers.

- **Do not** import from another package's `src/` directly.
- **Do** import shared types from `packages/contracts/`.
- If you need a type that doesn't exist, open an issue and PR to `packages/contracts/`.

---

## Debugging

```bash
# View API logs
pnpm --filter @eng-sim/api dev 2>&1 | pnpm pino-pretty

# View worker logs
pnpm --filter @eng-sim/worker dev

# Connect to local database
psql postgresql://postgres:postgres@localhost:5432/eng_sim_dev

# View queue jobs
psql -c "SELECT * FROM pgboss.job ORDER BY created_on DESC LIMIT 20;"
```

---

## What NOT to Build

Check [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md) and [`ROADMAP.md`](./ROADMAP.md) before building anything.

Items labeled `[PHASE 2]`, `[PHASE 3]`, `[FUTURE]` **must not** be implemented until the corresponding phase begins.

If you are unsure whether a feature is in scope, open an issue and tag it `question` before implementing.
