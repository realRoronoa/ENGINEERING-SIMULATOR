# DEVELOPER MAP

> The authoritative directory-to-owner mapping for the **two-developer** team.
> Ownership definitions and responsibilities live in [`TEAM.md`](./TEAM.md).
>
> **Packages are architectural modules, not teams.** This table says who maintains a module,
> not that the module belongs to a separate person.

---

## Ownership Summary

| Developer | Domain | Primary directories |
|---|---|---|
| **Dev 1** | Product / Frontend / Learning System | `apps/web/`, `apps/cli/`, `packages/content/`, `packages/learner-model/`, `packages/selector/`, `docs/product/` |
| **Dev 2** | Backend / Infrastructure / Evaluation | `apps/api/`, `apps/worker/`, `packages/database/`, `packages/evaluator/`, `packages/contracts/`, `packages/ai/`, `infrastructure/`, `reference-systems/` |
| **Shared** | Product, architecture, contracts, security, releases | `PRODUCT_SPEC.md`, `PROJECT_STATUS.md`, `RELEASE_PLAN.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, `SECURITY.md`, `PRIVACY.md`, `TESTING_STRATEGY.md`, `docs/decisions/`, `packages/shared/` |

`packages/contracts/` is **implemented by Dev 2 and governed jointly** — no contract change
lands without both developers agreeing first.

---

## Directory Breakdown

| Directory | Owner | Role |
|---|---|---|
| `apps/web` | Dev 1 | Learner web application |
| `apps/cli` | Dev 1 | Local task setup, test, submit, status |
| `apps/api` | Dev 2 | REST API server |
| `apps/worker` | Dev 2 | Grading worker |
| `packages/content` | Dev 1 | Skills, skill graph, templates, fault patterns, variants, hints, rubrics, misconceptions, viva questions |
| `packages/learner-model` | Dev 1 | Mastery state, evidence processing, misconception state, learner flags |
| `packages/selector` | Dev 1 | Rule-based task selection |
| `packages/database` | Dev 2 | PostgreSQL schema, migrations, typed data access |
| `packages/evaluator` | Dev 2 | Deterministic grading logic |
| `packages/ai` | Dev 2 | LLM integration, mentor, viva, usage tracking, grounding |
| `packages/contracts` | Dev 2 implements / **Shared governance** | Cross-boundary types |
| `packages/shared` | Shared | Small cross-cutting utilities only — **not** a second home for contracts |
| `infrastructure` | Dev 2 | Docker, Compose, CI/CD, deployment, monitoring, backups, secrets |
| `reference-systems` | Dev 2 | Shopverse: code, Docker, DB, tests, fault injection points |
| `docs/product` | Dev 1 | Product research, learner findings, content design notes |
| `docs/decisions` | Shared | ADRs |
| `docs/diagrams` | Shared | System and flow diagrams |
| `scripts/project-status` | Shared | Future status automation (documentation only) |
| `.github` | Shared | Issue/PR templates, labels, workflows |

---

## Dependency Map

```
Developer 1 — Product / Learning
  ├── depends on : API endpoints, packages/contracts, evaluation result shape
  ├── provides   : web app, CLI, authored content, mastery rules, selection rules
  └── consumes   : API responses, evaluation results, mentor/viva responses

Developer 2 — Platform / Backend
  ├── depends on : packages/contracts, content definitions (to map tests to variants)
  ├── provides   : REST API, persistence, grading execution, AI services, infrastructure
  └── consumes   : submissions from web/CLI, selection decisions, content metadata
```

### The three real coupling points

Everything else is independent. These three are where the two developers must coordinate:

| # | Boundary | Shape agreed in | Risk if it drifts |
|---|---|---|---|
| 1 | **Attempt / submission lifecycle** | `packages/contracts/`, `API_CONTRACT.md`, `TASK_LIFECYCLE.md` | Web and CLI disagree with the API about attempt state |
| 2 | **Evaluation result → evidence event** | `packages/contracts/`, `EVENT_CONTRACT.md`, `EVALUATION_POLICY.md` | Learner model computes mastery from a result it misreads |
| 3 | **Content metadata → grading mapping** | `packages/content/`, `CONTENT_AUTHORING.md` | A variant exists that the worker cannot grade |

---

## Interface Rules

1. Never import another package's `src/` internals. Import types from `packages/contracts/`.
2. Never write raw SQL outside `packages/database/`.
3. Never let AI decide code correctness — see [`../AI_POLICY.md`](../AI_POLICY.md).
4. Never generate a learner-facing problem at request time — see
   [`../PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md) (Principle 2).
5. A module with no owner listed above does not exist yet. Add it here in the same PR that
   creates it.

---

## When Ownership Is Unclear

Ask one question: **is this learner-facing product/learning work, or platform/execution work?**

- Learner-facing product, content, or learning logic → Dev 1
- Persistence, execution, serving, or operating → Dev 2
- Changes the contract, the data model, the product scope, or security → Shared, decide together

If the answer is genuinely both, it is a contract change. Agree the contract first.
