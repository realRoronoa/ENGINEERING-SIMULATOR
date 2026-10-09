# Engineering Simulator

A structured engineering practice platform. Learners work on real engineering tasks against a
real codebase, receive deterministically graded feedback, and build demonstrable, **verified**
capability — not course-completion badges.

Built by a **TWO-DEVELOPER TEAM**.

---

## Start Here

After cloning, these files answer everything you need to start working:

| Question                               | File                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| **What are we building?**              | [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)                      |
| **What version are we building?**      | [`RELEASE_PLAN.md`](./RELEASE_PLAN.md)                      |
| **What should I work on?**             | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) §3 and §8        |
| **What does the other developer own?** | [`docs/TEAM.md`](./docs/TEAM.md)                            |
| **What is already finished?**          | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) §4 and §5        |
| **What is blocked?**                   | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) §7               |
| **What remains?**                      | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) §2 and §8        |
| **What must NOT be built yet?**        | [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md) §12 and §16          |
| **What does "done" mean?**             | [`docs/WORKFLOW.md`](./docs/WORKFLOW.md#definition-of-done) |
| **What is true right now?**            | [`CURRENT_STATE.md`](./CURRENT_STATE.md)                    |

---

## Current State

**v0.0.1 — Monorepo Foundation Ready.**

The TypeScript ESM monorepo is established with npm workspaces:

- `apps/api` (Fastify API with Zod `/health` endpoint)
- `apps/web` (React + Vite + React Router shell)
- `packages/contracts` (Exported domain types & interfaces)
- Unified Vitest, ESLint, and Prettier configuration.

See [`CURRENT_STATE.md`](./CURRENT_STATE.md) for the live snapshot and [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for progress detail.

---

## Development Commands

### Prerequisites

- Node.js LTS (v20+)
- npm (v10+)

### Setup

```bash
npm install
```

### Build & Typecheck

```bash
# Build all workspaces
npm run build

# Run TypeScript type-checking across all workspaces
npm run typecheck
```

### Testing

```bash
# Run all Vitest unit and integration tests across workspaces
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Run ESLint checks
npm run lint

# Check code formatting with Prettier
npm run format:check

# Auto-format code with Prettier
npm run format
```

### Local Development Servers

```bash
# Run the Fastify API server in watch mode (apps/api)
npm run dev:api

# Run the React/Vite web application in dev mode (apps/web)
npm run dev:web
```

The frontend currently operates in **Demo Mode**. It uses `localStorage` for state persistence and does not require a backend connection to explore the full learner journey (signup, onboarding, dashboard, missions, evaluations, viva, and skill profile).

---

## Team

```
                    ENGINEERING SIMULATOR
                            |
              ┌─────────────┴─────────────┐
              |                           |
        DEVELOPER 1                 DEVELOPER 2
              |                           |
      Product / Learning          Platform / Backend
              |                           |
       ┌──────┼──────┐            ┌───────┼───────┐
       |      |      |            |       |       |
      Web   Content Selector      API   Eval    Infra
       |      |      |            |       |       |
      CLI Learner Model           DB    Worker   AI
```

**Developer 1 — Product / Frontend / Learning System**
`apps/web/` · `apps/cli/` · `packages/content/` · `packages/learner-model/` ·
`packages/selector/` · `docs/product/`

**Developer 2 — Backend / Infrastructure / Evaluation**
`apps/api/` · `apps/worker/` · `packages/database/` · `packages/evaluator/` ·
`packages/contracts/` · `packages/ai/` · `infrastructure/` · `reference-systems/`

**Shared:** product decisions · architecture · API contracts · database model · security ·
privacy · testing strategy · deployment · code reviews · issues · releases ·
`PROJECT_STATUS.md` · `PRODUCT_SPEC.md`

> Packages are **architectural modules, not individual developer teams.**
> Full breakdown: [`docs/TEAM.md`](./docs/TEAM.md) ·
> Directory map: [`docs/DEVELOPER_MAP.md`](./docs/DEVELOPER_MAP.md)

---

## Monorepo Structure

```
engineering-simulator/
├── apps/
│   ├── web/                 # Learner web application          (Dev 1)
│   ├── cli/                 # Local setup, test, submit         (Dev 1)
│   ├── api/                 # REST API server                   (Dev 2)
│   └── worker/              # Grading worker                    (Dev 2)
├── packages/
│   ├── content/             # Skills, templates, variants       (Dev 1)
│   ├── learner-model/       # Mastery, evidence, misconceptions (Dev 1)
│   ├── selector/            # Rule-based task selection         (Dev 1)
│   ├── database/            # Schema, migrations, data access   (Dev 2)
│   ├── evaluator/           # Deterministic grading             (Dev 2)
│   ├── ai/                  # LLM integration, mentor, viva     (Dev 2)
│   ├── contracts/           # Cross-boundary types              (Dev 2 / Shared governance)
│   └── shared/              # Small cross-cutting utilities     (Shared)
├── reference-systems/
│   └── shopverse/           # The codebase learners work in     (Dev 2)
├── infrastructure/          # Docker, CI/CD, deployment         (Dev 2)
├── docs/
│   ├── TEAM.md              # Ownership
│   ├── WORKFLOW.md          # How we work
│   ├── DEVELOPER_MAP.md     # Directory → owner
│   ├── FEATURE_INVENTORY.md # Every planned feature
│   ├── product/             # Product research, learner findings (Dev 1)
│   ├── decisions/           # ADRs                               (Shared)
│   └── diagrams/            # System and flow diagrams           (Shared)
├── scripts/
│   └── project-status/      # Future status automation (docs only)
└── .github/                 # Issue/PR templates, labels, workflows
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## The Loop

The product is a loop, not a feature list:

```
Diagnose → Learn → Build → Break → Debug → Verify → Reassess → Adapt
```

Four engines serve it:

| Engine             | Module                                 | Owner |
| ------------------ | -------------------------------------- | ----- |
| **Content Engine** | `packages/content/`                    | Dev 1 |
| **Learner Model**  | `packages/learner-model/`              | Dev 1 |
| **Selector**       | `packages/selector/`                   | Dev 1 |
| **Evaluator**      | `packages/evaluator/` + `apps/worker/` | Dev 2 |

---

## Non-Negotiables

1. **Humans author knowledge; machines create variety.**
2. **Every learner-facing problem is pre-built and pre-validated.** Never generate one live.
3. **Deterministic evaluation comes before AI.** Tests decide code correctness; AI never does.
4. **Logs and metrics come from running code.** No fabricated production logs.
5. **Learning is measured by AI-off transfer**, not practice pass rate.

See [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md) for the full principles and
[`AI_POLICY.md`](./AI_POLICY.md) for the AI boundary.

---

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md).

**Critical rule:** every feature PR must update [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
in the same PR. A PR without a status update is incomplete.

---

## Document Map

### Product and tracking

| File                                       | Purpose                                |
| ------------------------------------------ | -------------------------------------- |
| [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)     | Single source of truth for the product |
| [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md)   | MVP boundary and product principles    |
| [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) | Living progress record                 |
| [`CURRENT_STATE.md`](./CURRENT_STATE.md)   | What is true right now                 |
| [`ROADMAP.md`](./ROADMAP.md)               | Phase 0 → Phase 6                      |
| [`RELEASE_PLAN.md`](./RELEASE_PLAN.md)     | Per-version scope and blockers         |
| [`CHANGELOG.md`](./CHANGELOG.md)           | Shipped history                        |

### Engineering

| File                                             | Purpose                               |
| ------------------------------------------------ | ------------------------------------- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)           | System architecture                   |
| [`DEVELOPMENT.md`](./DEVELOPMENT.md)             | Local development and conventions     |
| [`API_CONTRACT.md`](./API_CONTRACT.md)           | HTTP contract                         |
| [`EVENT_CONTRACT.md`](./EVENT_CONTRACT.md)       | Internal event contract               |
| [`DATABASE.md`](./DATABASE.md)                   | Schema                                |
| [`TASK_LIFECYCLE.md`](./TASK_LIFECYCLE.md)       | Task authoring → attempt → grading    |
| [`CONTENT_AUTHORING.md`](./CONTENT_AUTHORING.md) | How content is authored and validated |
| [`EVALUATION_POLICY.md`](./EVALUATION_POLICY.md) | How grading decides                   |
| [`AI_POLICY.md`](./AI_POLICY.md)                 | What AI may and may not do            |
| [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md)   | Test layers and ownership             |
| [`OBSERVABILITY.md`](./OBSERVABILITY.md)         | Logs, metrics, tracing                |
| [`SECURITY.md`](./SECURITY.md)                   | Security model                        |
| [`PRIVACY.md`](./PRIVACY.md)                     | Data we store and do not store        |
