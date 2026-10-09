# ARCHITECTURE

Engineering Simulator is a **monorepo**. Packages exist for **architectural modularity**, not
for team sizing.

> **Important:** there are **two developers**, not one per package.
> A package boundary is an interface boundary. It is not an ownership boundary for a separate
> person. See [`docs/TEAM.md`](./docs/TEAM.md).

---

## Two-Developer Mapping

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

| Developer                      | Modules                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dev 1 — Product / Learning** | `apps/web`, `apps/cli`, `packages/content`, `packages/learner-model`, `packages/selector`                                                        |
| **Dev 2 — Platform / Backend** | `apps/api`, `apps/worker`, `packages/database`, `packages/evaluator`, `packages/ai`, `packages/contracts`, `infrastructure`, `reference-systems` |
| **Shared**                     | `packages/contracts` governance, `packages/shared`, `docs/decisions`, architecture, security, data model                                         |

---

## Why a Monorepo With Two Developers

1. **One atomic change across the boundary.** A contract change plus both implementations lands
   in a reviewable sequence, in one repository.
2. **No version negotiation between two people.** Cross-repo version pinning is pure overhead
   at this size.
3. **Full-system visibility.** Either developer can read the whole system without cloning five
   repositories.
4. **Module boundaries still enforced** — by `packages/contracts/` and the import rules below,
   not by repository walls.

See [`docs/decisions/ADR-001-monorepo.md`](./docs/decisions/ADR-001-monorepo.md).

---

## System Shape

```
   ┌──────────┐        ┌──────────┐
   │ apps/web │        │ apps/cli │          Dev 1
   └────┬─────┘        └────┬─────┘
        │   HTTP (API_CONTRACT.md)  │
        └─────────────┬─────────────┘
                      ▼
               ┌─────────────┐
               │  apps/api   │               Dev 2
               └──┬───┬───┬──┘
      ┌───────────┘   │   └───────────┐
      ▼               ▼               ▼
┌───────────┐  ┌─────────────┐  ┌──────────┐
│ packages/ │  │  packages/  │  │ packages/│
│ database  │  │ selector +  │  │   ai     │  Dev 2 / Dev 1 / Dev 2
└───────────┘  │learner-model│  └──────────┘
               └──────┬──────┘
                      │ reads
               ┌──────▼──────┐
               │  packages/  │              Dev 1
               │   content   │
               └─────────────┘

               ┌─────────────┐   grading job
               │ apps/worker │◀──────────────┐    Dev 2
               └──────┬──────┘               │
                      │ runs                 │
          ┌───────────▼───────────┐          │
          │ reference-systems/    │          │
          │ shopverse (Docker)    │          │
          └───────────┬───────────┘          │
                      │ result               │
                      └──────────────────────┘
                        EVENT_CONTRACT.md
```

All cross-module types live in `packages/contracts/`.

---

## Core Engines

### 1. Content Engine — `packages/content/` (Dev 1)

Human-authored skills, skill graph, task templates, fault patterns, validated variants, hint
ladders, rubrics, misconceptions, viva questions. Nothing learner-facing is generated at
request time.

### 2. Learner Model — `packages/learner-model/` (Dev 1)

Per-skill mastery (Beta model), evidence events, misconception state, learner flags. Consumes
evaluation and viva results; produces the capability picture the selector reads.

### 3. Selector — `packages/selector/` (Dev 1)

Rule-based selection of the next task: skill, variant, difficulty, support level. Every
decision must be explainable from the learner's stored evidence.
See [`docs/decisions/ADR-005-rule-based-selector-first.md`](./docs/decisions/ADR-005-rule-based-selector-first.md).

### 4. Evaluator — `packages/evaluator/` + `apps/worker/` (Dev 2)

Applies the submission and runs hidden tests and benchmarks in isolated Docker containers with
resource limits. Deterministic and reproducible. **Tests decide correctness; AI does not.**
See [`docs/decisions/ADR-002-deterministic-evaluation.md`](./docs/decisions/ADR-002-deterministic-evaluation.md).

---

## Attempt-Centered Design

The API is organized around **Attempts**. An attempt represents a learner's full engagement
with one task variant: assignment → work → submission → evaluation → viva → evidence update.

This keeps the loop auditable: every piece of evidence traces back to an attempt, and every
attempt traces back to a selector decision.

See [`docs/decisions/ADR-004-attempt-centered-api.md`](./docs/decisions/ADR-004-attempt-centered-api.md)
and [`TASK_LIFECYCLE.md`](./TASK_LIFECYCLE.md).

---

## Architectural Rules

These are what make a two-person monorepo stay clean.

1. **Contracts only across boundaries.** Never import another package's `src/` internals.
   Shared types live in `packages/contracts/`.
2. **Raw SQL only in `packages/database/`.** Everything else uses the typed access layer.
3. **No business logic in the data layer.** Data functions are thin wrappers.
4. **Deterministic before AI.** AI may grade reasoning against rubrics; never code correctness.
5. **No live problem generation.** The selector picks from pre-validated content.
6. **Logs and metrics come from running code.** Never fabricated.
7. **AI-off is enforced server-side**, not just hidden in the UI.
8. **Hidden tests never cross the API boundary** — not in responses, logs, or error messages.

---

## Boundary Ownership

The three places the two developers must coordinate:

| Boundary                           | Contract                                    | Owner of the shape |
| ---------------------------------- | ------------------------------------------- | ------------------ |
| Attempt / submission lifecycle     | `API_CONTRACT.md`, `packages/contracts/`    | Shared             |
| Evaluation result → evidence event | `EVENT_CONTRACT.md`, `packages/contracts/`  | Shared             |
| Content metadata → grading mapping | `CONTENT_AUTHORING.md`, `packages/content/` | Shared             |

Everything else is one developer's call within their domain.

---

## Decision Records

| ADR                                                               | Decision                   |
| ----------------------------------------------------------------- | -------------------------- |
| [ADR-001](./docs/decisions/ADR-001-monorepo.md)                   | Monorepo                   |
| [ADR-002](./docs/decisions/ADR-002-deterministic-evaluation.md)   | Deterministic evaluation   |
| [ADR-003](./docs/decisions/ADR-003-no-live-problem-generation.md) | No live problem generation |
| [ADR-004](./docs/decisions/ADR-004-attempt-centered-api.md)       | Attempt-centered API       |
| [ADR-005](./docs/decisions/ADR-005-rule-based-selector-first.md)  | Rule-based selector first  |

Architecture decisions are a **shared** responsibility. No major architectural decision belongs
exclusively to one developer. New decisions get an ADR, authored by one developer and reviewed
by the other.

---

## Diagrams

- [`docs/diagrams/system-context.md`](./docs/diagrams/system-context.md)
- [`docs/diagrams/learner-flow.md`](./docs/diagrams/learner-flow.md)
- [`docs/diagrams/submission-flow.md`](./docs/diagrams/submission-flow.md)
- [`docs/diagrams/selector-flow.md`](./docs/diagrams/selector-flow.md)
- [`docs/diagrams/evaluation-flow.md`](./docs/diagrams/evaluation-flow.md)
