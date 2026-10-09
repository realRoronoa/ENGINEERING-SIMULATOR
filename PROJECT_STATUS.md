# ENGINEERING SIMULATOR — PROJECT STATUS

> **Purpose:** At any moment, a developer should open this file and understand exactly how much
> of the product is built, what is currently being worked on, what is blocked, and what remains.
>
> This is **not** a TODO list. It is the living progress record of the product.
> It is **jointly owned** by Developer 1 and Developer 2.
>
> **Update rule:** see [`CONTRIBUTING.md` → PROJECT STATUS UPDATE RULE](./CONTRIBUTING.md#project-status-update-rule).
> A feature PR is incomplete if this file is not updated in the same PR.

**Last Updated:** 2026-10-08
**Current Version:** v0.0.1 (repository scaffold — no product code)
**Current Phase:** Phase 0 — Validation
**Overall Completion:** 2%
**Current Sprint:** Sprint 1 — Phase 0 Validation Setup

--------------------------------------------------
## 1. CURRENT STATE

**Phase:** Phase 0 — Validation

**Status:**
IN DEVELOPMENT (documentation and architecture only — no application code exists yet)

**Overall:**
2%

| Area | Owner | % | Note |
|---|---|---:|---|
| Frontend | Dev 1 | 0% | `apps/web/` has a README only |
| Backend | Dev 2 | 0% | `apps/api/` has a README only |
| Database | Dev 2 | 0% | Schema designed in `DATABASE.md`, no migrations |
| Evaluation | Dev 2 | 0% | Policy written in `EVALUATION_POLICY.md`, no grader |
| Learning System | Dev 1 | 0% | Mastery/selector rules designed, not implemented |
| AI | Dev 2 | 0% | Policy written in `AI_POLICY.md`, no integration |
| CLI | Dev 1 | 0% | `apps/cli/` has a README only |
| Infrastructure | Dev 2 | 0% | No Docker/Compose files yet |
| Content | Dev 1 | 0% | 0 skills, 0 templates, 0 variants authored |
| Documentation / Contracts | Shared | 85% | Architecture, contracts, policies, tracking in place |

**Honest summary:**
The repository is a documented architecture, not a running product.
Nothing is deployed. Nothing is executable. The next real milestone is Phase 0 validation
evidence — not code.

--------------------------------------------------
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

--------------------------------------------------
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
- [ ] Stand up Shopverse locally in Docker (runs, migrates, seeds)
- [ ] Prove one fault can be injected and caught by a hidden test
- [ ] Draft the first database migration set from `DATABASE.md` (not applied in prod)
- [ ] Pick and document the LLM provider + model config in `AI_POLICY.md`

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

--------------------------------------------------
## 4. FEATURE STATUS

Status values MUST be one of:
`NOT_STARTED` · `PLANNED` · `IN_PROGRESS` · `BLOCKED` · `REVIEW` · `TESTING` · `DONE` · `DEFERRED`

| Feature | Owner | Phase | Status | % | Blocked By |
|---|---|---|---|---:|---|
| Landing | Dev 1 | P1 | NOT_STARTED | 0% | — |
| Onboarding | Dev 1 | P1 | NOT_STARTED | 0% | — |
| Diagnostic | Dev 1 | P2 | NOT_STARTED | 0% | Skill graph v0 |
| Skill Profile | Dev 1 | P2 | NOT_STARTED | 0% | Learner Model |
| Task Workspace | Dev 1 | P1 | NOT_STARTED | 0% | API |
| CLI | Dev 1 | P1 | NOT_STARTED | 0% | API, Shopverse |
| API | Dev 2 | P1 | NOT_STARTED | 0% | Database |
| Database | Dev 2 | P1 | PLANNED | 0% | — |
| Grading | Dev 2 | P1 | NOT_STARTED | 0% | Shopverse, hidden tests |
| AI Mentor | Dev 2 | P1 | NOT_STARTED | 0% | API, model config |
| Viva | Dev 2 | P1 | NOT_STARTED | 0% | AI Mentor, rubrics |
| Selector | Dev 1 | P2 | NOT_STARTED | 0% | Learner Model, content |
| Learner Model | Dev 1 | P2 | NOT_STARTED | 0% | Evidence events |
| Shopverse | Dev 2 | P1 | IN_PROGRESS | 5% | — |
| Infrastructure | Dev 2 | P1 | PLANNED | 0% | — |

--------------------------------------------------
## 5. COMPLETED THIS WEEK

Week of 2026-10-06:
- Restructured repository ownership from a multi-developer model to a two-developer model
- Created `docs/TEAM.md`, `docs/WORKFLOW.md`, `docs/FEATURE_INVENTORY.md`
- Created `PROJECT_STATUS.md`, `PRODUCT_SPEC.md`, `CURRENT_STATE.md`, `RELEASE_PLAN.md`, `CHANGELOG.md`
- Added the PROJECT STATUS UPDATE RULE to `CONTRIBUTING.md`
- Added GitHub issue templates and a documented label taxonomy
- Added `scripts/project-status/` as documentation-only structure for future automation

--------------------------------------------------
## 6. CURRENTLY IN PROGRESS

| Work | Owner | Started | Note |
|---|---|---|---|
| Phase 0 interview round | Dev 1 | 2026-10-08 | 0 of 3 student interviews done |
| Manual mission #1 draft | Dev 1 | 2026-10-08 | Task brief being written |
| Shopverse local Docker bring-up | Dev 2 | 2026-10-08 | Compose file not written yet |
| Fault-injection + hidden-test spike | Dev 2 | 2026-10-08 | Proving grading feasibility |

Nothing else is in progress. If it is not in this table, it is not being worked on.

--------------------------------------------------
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

--------------------------------------------------
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

--------------------------------------------------
## 9. TECHNICAL DEBT

| Issue | Impact | Priority | Owner | Planned Phase |
|---|---|---|---|---|
| No CI pipeline configured | Nothing is checked automatically; regressions land silently | P2 | Dev 2 | Phase 1 |
| No `package.json` / workspace wiring | Monorepo is documented but not installable | P1 | Dev 2 | Phase 1 |
| `packages/shared` purpose overlaps `packages/contracts` | Risk of types drifting into the wrong package | P3 | Shared | Phase 1 |
| Skill list in `PRODUCT_SCOPE.md` is a placeholder | Content work cannot start from it as-is | P2 | Dev 1 | Phase 0 |

--------------------------------------------------
## 10. TEST STATUS

| Suite | Owner | Count | Passing | Coverage | Note |
|---|---|---:|---:|---:|---|
| Unit tests | Shared | 0 | 0 | — | No code to test yet |
| Integration tests | Dev 2 | 0 | 0 | — | Requires API + DB |
| E2E tests | Shared | 0 | 0 | — | Requires web + API + worker |
| Evaluator tests | Dev 2 | 0 | 0 | — | Requires Docker grading |
| API tests | Dev 2 | 0 | 0 | — | Requires API |
| Content validation | Dev 1 | 0 | 0 | — | Requires authored variants |
| Security tests | Shared | 0 | 0 | — | Requires auth + API |

Target at V1: 80% line coverage on `packages/evaluator`, `packages/selector`,
`packages/learner-model`; 100% of API endpoints covered by an integration test.
See [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md).

--------------------------------------------------
## 11. DEPLOYMENT STATUS

### Development
| Service | State | Where |
|---|---|---|
| Frontend | Not running | — |
| Backend | Not running | — |
| Database | Not running | — |
| Worker | Not running | — |
| CLI | Not published | — |
| Reference system | Not running | — |

### Staging
Does not exist. Planned for Phase 2.

### Production
Does not exist. Planned for Phase 3 (first college pilot).

--------------------------------------------------
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
