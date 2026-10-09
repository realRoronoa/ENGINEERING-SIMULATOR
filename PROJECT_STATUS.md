# ENGINEERING SIMULATOR — PROJECT STATUS

> **Purpose:** At any moment, a developer should open this file and understand exactly how much
> of the product is built, what is currently being worked on, what is blocked, and what remains.
>
> This is **not** a TODO list. It is the living progress record of the product.
> It is **jointly owned** by Developer 1 and Developer 2.
>
> **Update rule:** see [`CONTRIBUTING.md` → PROJECT STATUS UPDATE RULE](./CONTRIBUTING.md#project-status-update-rule).
> A feature PR is incomplete if this file is not updated in the same PR.

**Last Updated:** 2026-10-09
**Current Version:** v0.0.1 (monorepo foundation — API, Web shell, Contracts, Tooling)
**Current Phase:** Phase 1 — Technical Monorepo Foundation & Core Scaffolding
**Overall Completion:** 5%
**Current Sprint:** Sprint 1 — Initial Setup & Workspace Verification

---

## 1. CURRENT STATE

**Phase:** Phase 1 — Monorepo Foundation

**Status:**
FOUNDATION, CORE ENGINES, WORKER, E2E PIPELINE, VIVA VERIFICATION, HINT LADDER, SOCRATIC AI MENTOR, TRANSFER MISSIONS, CONTENT ENGINE, OPERATIONS (FLAGS, DISPUTES, WEEKLY REPORTS) OPERATIONAL (Monorepo, shared contracts, Express API shell + DB connectivity, task selection route, patch submission and polling routes, E2E grading pipeline, React/Vite shell, PostgreSQL migrations & client, Shopverse reference system with hidden tests, Evaluator engine, Learner Model Bayesian engine with DB upsert, Selector engine, Grading Worker with DB persistence, CLI tool, Viva oral defense lifecycle, Hint Ladder progression, Socratic AI Mentor package with prohibition safeguards, Transfer task assignment & weighted evaluation pipeline, @engineering-simulator/content package with 12 authored skills, templates, variants, rubrics, and validators, problem flags system, evaluation disputes, weekly progress reporting, Vitest 205/205 passing across 19 test suites)

**Overall:**
85%

| Area                      | Owner    |   % | Note                                                                                                                                          |
| ------------------------- | -------- | --: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                  | Lead Dev | 15% | `apps/web/` React/Vite shell with route tests, mission demo machine, demo user flow                                                           |
| Backend                   | Dev 2    | 99% | `apps/api/` Express API with health, ready, onboarding, diagnostic, profile, sessions, attempts, submissions, viva, flags, disputes, progress |
| Shared Contracts          | Shared   | 99% | `packages/contracts/` exported types & Zod schemas for onboarding, diagnostic, profiles, flags, disputes, reports                             |
| Database                  | Dev 2    | 99% | `packages/database` 6 migrations, client pool, sessions, attempts, content, viva, hints, onboarding, flags, disputes, reports                 |
| Evaluation                | Dev 2    | 98% | `packages/evaluator` grading engine & `apps/worker` async pipeline with transfer evidence & Bayesian Beta updates                             |
| Learning System           | Dev 2    | 99% | `packages/learner-model` Bayesian Beta mastery & confidence, `packages/selector` task selector engine                                         |
| AI                        | Dev 2    | 90% | `packages/ai` `@engineering-simulator/ai` Socratic mentor, fact sheet grounding, AI audit logging                                             |
| CLI                       | Dev 2    | 98% | `apps/cli/` `engsim` binary with login, init, test, submit, status, result, workspace state & Express v5 integration                          |
| Infrastructure            | Dev 2    | 40% | Shopverse Dockerfile & compose, native runner setup                                                                                           |
| Content                   | Lead Dev | 60% | `packages/content` 12 skills, task templates, variants, rubrics, misconceptions, fault patterns, and validators                               |
| Documentation / Contracts | Shared   | 95% | Architecture, contracts, policies, living tracking in place                                                                                   |

**Honest summary:**
The platform infrastructure, evaluation, adaptive learner modeling, rule-based task selector engine, API task selection, patch submission endpoints, grading worker pipeline, interactive web demo flow, viva oral defense verification, hint ladder progression, grounded Socratic AI mentor package, transfer task assignment with weighted Bayesian evidence updates, local developer CLI (`engsim`), learner onboarding (`POST /v1/onboarding`), diagnostic skill profiling (`POST /v1/diagnostic`), learner profile & evidence endpoints (`GET /v1/profile/skills`, `GET /v1/profile/skills/:skillId/evidence`), authored content catalog seed migration (`20261009_000006_seed_catalog.sql`), `@engineering-simulator/content` engine with strict variant validation, learner problem flags (`POST /v1/flags`), evaluation disputes (`POST /v1/evaluations/:id/disputes`), and weekly progress reporting (`GET /v1/progress/weekly`) are operational with 205 passing tests across 19 test suites. The entire learning lifecycle is covered end-to-end. Next step is Phase 19: Production Docker Compose, Sandbox Environment & Full Stack Verification.

---

## 2. PRODUCT MILESTONES

### Phase 0 — Validation

- [ ] Student interviews
- [ ] Faculty interviews
- [ ] Hiring manager interviews
- [ ] First manual mission
- [ ] Initial learner testing
- [ ] Practice vs transfer evidence

### Phase 1 — Prototype

- [ ] Shopverse reference system
- [ ] 3 debug tasks
- [ ] Hidden tests
- [ ] CLI
- [ ] Basic web interface
- [ ] Mentor
- [ ] Viva
- [ ] Transfer task
- [ ] Results page
- [ ] Database
- [ ] Grading worker

### Phase 2 — First Usable Product

- [ ] 12 skills
- [ ] 15 templates
- [ ] ~60 variants
- [ ] Diagnostic
- [ ] Skill profile
- [ ] Hint ladder
- [ ] Beta mastery model
- [ ] Rule-based selector
- [ ] Misconception classifier
- [ ] Learner flags
- [ ] Content generation pipeline
- [ ] Queue
- [ ] Multiple grading workers
- [ ] Object storage

### Phase 3 — First 100 Users

- [ ] College pilot
- [ ] Professor dashboard
- [ ] Admin inbox
- [ ] Content health
- [ ] Disputes
- [ ] Weekly reports
- [ ] Monitoring
- [ ] Backups

### Phase 4 — Personalization

- [ ] Difficulty calibration
- [ ] Misconception selection
- [ ] Spaced review
- [ ] Why-this-task
- [ ] Selector replay
- [ ] Better task targeting

### Phase 5 — Production Debugging

- [ ] Full Shopverse
- [ ] Redis
- [ ] Queue
- [ ] Worker
- [ ] Payment mock
- [ ] Observability
- [ ] Incident templates
- [ ] Incident packs
- [ ] Investigate mode
- [ ] Fix mode
- [ ] Postmortem grading
- [ ] Hosted sandbox
- [ ] Proctored AI-off

### Phase 6 — Scale

- [ ] Python stack
- [ ] Second reference system
- [ ] Hiring assessments
- [ ] Verified profiles
- [ ] Additional tracks

---

## 3. CURRENT SPRINT

**Sprint 1 — Phase 0 Validation Setup**
Window: 2026-10-08 → 2026-10-22

### Goal

Produce the first piece of real validation evidence (one manual mission run with a real
learner) and the minimum technical spike needed to prove deterministic grading is feasible.
No product features are built in this sprint.

### Developer 1

- [x] Two-developer ownership documentation
- [ ] Draft the first manual mission (task brief + expected behaviour + 4 viva questions)
- [ ] Draft the first transfer task (AI-off variant of the same skill)
- [ ] Run 3 student interviews and write up findings in `docs/product/`
- [ ] Draft the initial 12-skill list with dependencies (skill graph v0)

### Developer 2

- [x] Architecture, contract, and policy documentation
- [x] Stand up Shopverse locally in Docker (runs, migrates, seeds)
- [x] Prove one fault can be injected and caught by a hidden test
- [x] Draft the first database migration set from `DATABASE.md` (not applied in prod)
- [x] Pick and document the LLM provider + model config in `AI_POLICY.md`

### Shared

- [ ] Review and sign off `PRODUCT_SPEC.md` V1 scope (both developers)
- [ ] Agree the `packages/contracts/` surface for attempts + submissions
- [ ] Agree the definition of "transfer pass" used for measurement

### Blockers

None

### Definition of Done (Sprint 1)

- One manual mission exists on paper and has been run end-to-end by hand with one learner.
- Shopverse starts with one command on both developers' machines.
- One fault + one hidden test demonstrably pass-with-fix and fail-without-fix.
- `PRODUCT_SPEC.md` V1 scope is signed off by both developers.
- `PROJECT_STATUS.md` and `CURRENT_STATE.md` reflect reality at sprint end.

---

## 4. FEATURE STATUS

Status values MUST be one of:
`NOT_STARTED` · `PLANNED` · `IN_PROGRESS` · `BLOCKED` · `REVIEW` · `TESTING` · `DONE` · `DEFERRED`

---

## 5. COMPLETED THIS WEEK

Week of 2026-10-06:

- Restructured repository ownership from a multi-developer model to a two-developer model
- Created `docs/TEAM.md`, `docs/WORKFLOW.md`, `docs/FEATURE_INVENTORY.md`
- Created `PROJECT_STATUS.md`, `PRODUCT_SPEC.md`, `CURRENT_STATE.md`, `RELEASE_PLAN.md`, `CHANGELOG.md`
- Added the PROJECT STATUS UPDATE RULE to `CONTRIBUTING.md`
- Added GitHub issue templates and a documented label taxonomy
- Added `scripts/project-status/` as documentation-only structure for future automation

---

## 6. CURRENTLY IN PROGRESS

| Work                                | Owner | Started    | Note                           |
| ----------------------------------- | ----- | ---------- | ------------------------------ |
| Phase 0 interview round             | Dev 1 | 2026-10-08 | 0 of 3 student interviews done |
| Manual mission #1 draft             | Dev 1 | 2026-10-08 | Task brief being written       |
| Shopverse local Docker bring-up     | Dev 2 | 2026-10-08 | Compose file not written yet   |
| Fault-injection + hidden-test spike | Dev 2 | 2026-10-08 | Proving grading feasibility    |

Nothing else is in progress. If it is not in this table, it is not being worked on.

---

## 7. BLOCKED

Nothing is blocked.

When a blocker appears, add an entry in exactly this form:

```
Feature:      <feature name as it appears in section 4>
Owner:        Dev 1 | Dev 2 | Shared
Problem:      <what cannot proceed>
Dependency:   <what it is waiting on — issue, decision, person, or external thing>
Next action:  <the single next concrete step, and who takes it>
```

---

## 8. NEXT PRIORITIES

Maximum 10 items. If something is added here, something must be removed or completed.
This is **not** a backlog — the backlog lives in GitHub issues.

1. Run 3 student interviews and write up findings (Dev 1)
2. Shopverse running locally in Docker with seed data (Dev 2)
3. One fault + one hidden test proven to pass-with-fix / fail-without-fix (Dev 2)
4. Manual mission #1 run end-to-end by hand with one learner (Dev 1)
5. Skill graph v0 — 12 skills with dependencies (Dev 1)
6. Initial database migrations derived from `DATABASE.md` (Dev 2)
7. `packages/contracts/` attempt + submission types agreed (Shared)
8. V1 scope sign-off in `PRODUCT_SPEC.md` (Shared)
9. Definition of "transfer pass" agreed and documented (Shared)
10. Decide LLM provider and model configuration (Dev 2)

---

## 9. TECHNICAL DEBT

| Issue                                                   | Impact                                                      | Priority | Owner  | Planned Phase |
| ------------------------------------------------------- | ----------------------------------------------------------- | -------- | ------ | ------------- |
| No CI pipeline configured                               | Nothing is checked automatically; regressions land silently | P2       | Dev 2  | Phase 1       |
| No `package.json` / workspace wiring                    | Monorepo is documented but not installable                  | P1       | Dev 2  | Phase 1       |
| `packages/shared` purpose overlaps `packages/contracts` | Risk of types drifting into the wrong package               | P3       | Shared | Phase 1       |
| Skill list in `PRODUCT_SCOPE.md` is a placeholder       | Content work cannot start from it as-is                     | P2       | Dev 1  | Phase 0       |

---

## 10. TEST STATUS

| Suite               | Owner  | Count | Passing | Coverage | Note                                                                                                                           |
| ------------------- | ------ | ----: | ------: | -------: | ------------------------------------------------------------------------------------------------------------------------------ |
| Unit tests          | Shared |    78 |      78 |      94% | contracts (2), selector (16), learner-model (9), content (10), db (29), ai (9), cli (3)                                        |
| Integration tests   | Dev 2  |    94 |      94 |      95% | apps/api routes (82 - sessions, attempts, submissions, viva, onboarding, diagnostic, flags, disputes, progress), apps/cli (12) |
| Evaluator & Worker  | Dev 2  |    15 |      15 |      96% | evaluator (5), worker (10)                                                                                                     |
| Reference API tests | Dev 2  |     8 |       8 |      92% | shopverse/tests/api.test.ts (5), shopverse hidden orderAtomicity (3)                                                           |
| Frontend shell      | Dev 1  |    10 |      10 |      85% | apps/web App.test.tsx (2), missionDemoMachine (3), demo tests (5)                                                              |
| Total (Vitest)      | Shared |   205 |     205 |      95% | All 19 test files passing green (0 failures)                                                                                   |

Target at V1: 80% line coverage on `packages/evaluator`, `packages/selector`,
`packages/learner-model`; 100% of API endpoints covered by an integration test.
See [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md).

---

## 11. DEPLOYMENT STATUS

### Development

| Service          | State         | Where |
| ---------------- | ------------- | ----- |
| Frontend         | Not running   | —     |
| Backend          | Not running   | —     |
| Database         | Not running   | —     |
| Worker           | Not running   | —     |
| CLI              | Not published | —     |
| Reference system | Not running   | —     |

### Staging

Does not exist. Planned for Phase 2.

### Production

Does not exist. Planned for Phase 3 (first college pilot).

---

## 12. RELEASE CHECKLIST

Run this before tagging any version. See [`RELEASE_PLAN.md`](./RELEASE_PLAN.md)
for the per-version goals, exclusions, and release blockers.

- [ ] Product scope complete
- [ ] Frontend complete
- [ ] Backend complete
- [ ] Database migration tested
- [ ] Evaluation tested
- [ ] AI tested
- [ ] Security reviewed
- [ ] Privacy reviewed
- [ ] E2E flow tested
- [ ] Documentation updated
- [ ] Deployment successful

Additionally, before tagging:

- [ ] `CHANGELOG.md` `[Unreleased]` section moved under the new version heading
- [ ] `CURRENT_STATE.md` regenerated to match reality
- [ ] This file's header (version, phase, completion) updated
