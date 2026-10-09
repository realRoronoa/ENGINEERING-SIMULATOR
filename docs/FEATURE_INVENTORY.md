# FEATURE INVENTORY

> The canonical list of every feature in the product, with its module, owner, and target
> version. **This file answers "does this feature exist as a plan, and whose is it?"**
>
> It does **not** track progress. Live status lives in
> [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) §4.
> Version scope lives in [`../RELEASE_PLAN.md`](../RELEASE_PLAN.md).
>
> If a feature is not in this table, it is not planned. Add it here in the PR that plans it.

Owners: **Dev 1** = Product / Frontend / Learning System · **Dev 2** = Backend / Infrastructure /
Evaluation · **Shared** = both. See [`TEAM.md`](./TEAM.md).

---

## 1. Learner Frontend — `apps/web/` (Dev 1)

| Feature            | Owner | Version | Phase | Notes                              |
| ------------------ | ----- | ------- | ----- | ---------------------------------- |
| Landing            | Dev 1 | V1      | P1    | Public entry point                 |
| Authentication UI  | Dev 1 | V1      | P1    | Against Dev 2's auth integration   |
| Onboarding         | Dev 1 | V1      | P1    |                                    |
| Goal selection     | Dev 1 | V1      | P1    | Target role, weekly time           |
| Diagnostic         | Dev 1 | V1      | P2    | Baseline assessment                |
| Skill profile      | Dev 1 | V1      | P2    | Reads learner model                |
| Dashboard          | Dev 1 | V1      | P1    |                                    |
| Task workspace     | Dev 1 | V1      | P1    |                                    |
| Editor             | Dev 1 | V1      | P1    |                                    |
| Terminal UI        | Dev 1 | V1      | P1    |                                    |
| Mentor UI          | Dev 1 | V1      | P1    | Calls Dev 2's mentor API           |
| Hints UI           | Dev 1 | V1      | P2    | Authored hint ladder               |
| Submission UI      | Dev 1 | V1      | P1    |                                    |
| Evaluation results | Dev 1 | V1      | P1    | Must never leak hidden tests       |
| Viva UI            | Dev 1 | V1      | P1    | 4 questions                        |
| Transfer UI        | Dev 1 | V1      | P1    | AI-off mode enforced in UI and API |
| Progress           | Dev 1 | V1      | P1    |                                    |
| Weekly report      | Dev 1 | V1      | P2    |                                    |

## 2. CLI — `apps/cli/` (Dev 2)

| Feature            | Owner | Version | Phase | Notes                             |
| ------------------ | ----- | ------- | ----- | --------------------------------- |
| Local task setup   | Dev 2 | V1      | P1    | Pulls variant, prepares workspace |
| Test command       | Dev 2 | V1      | P1    | Runs visible tests locally        |
| Submission command | Dev 2 | V1      | P1    | Sends patch to API                |
| Status command     | Dev 2 | V1      | P1    | Attempt + grading state           |
| Result command     | Dev 2 | V1      | P1    | Structured evaluation result      |

## 3. Learning System Implementation — `packages/learner-model/`, `packages/selector/` (Dev 2)

| Feature                            | Owner | Version | Phase | Notes                              |
| ---------------------------------- | ----- | ------- | ----- | ---------------------------------- |
| Skill definitions (implementation) | Dev 2 | V1      | P2    | 12 skills                          |
| Skill graph (implementation)       | Dev 2 | V1      | P2    | Dependencies between skills        |
| Mastery rules (Beta model)         | Dev 2 | V1      | P2    |                                    |
| Evidence processing                | Dev 2 | V1      | P2    | Consumes evaluation + viva results |
| Misconception state                | Dev 2 | V1      | P2    |                                    |
| Misconception classifier           | Dev 2 | V1      | P2    | Rule-based first                   |
| Learner flags                      | Dev 2 | V1      | P2    | Integrity + content health signals |
| Rule-based selector                | Dev 2 | V1      | P2    | Explainable decisions              |
| Difficulty calibration             | Dev 2 | V2      | P4    | From observed outcomes             |
| Misconception-driven selection     | Dev 2 | V2      | P4    |                                    |
| Spaced review                      | Dev 2 | V2      | P4    |                                    |
| Why-this-task                      | Dev 2 | V2      | P4    | Surface the selector's reason      |
| Selector replay                    | Dev 2 | V2      | P4    | Audit a past decision              |

## 4. Content — `packages/content/` (Dev 1)

| Feature                        | Owner | Version | Phase | Notes                             |
| ------------------------------ | ----- | ------- | ----- | --------------------------------- |
| 12 skills authored             | Dev 1 | V1      | P2    |                                   |
| 15 task templates              | Dev 1 | V1      | P2    |                                   |
| ~60 validated variants         | Dev 1 | V1      | P2    | Each must pass content validation |
| Fault patterns                 | Dev 1 | V1      | P2    |                                   |
| Expected behaviour definitions | Dev 1 | V1      | P2    | Input to Dev 2's hidden tests     |
| Hint ladders                   | Dev 1 | V1      | P2    |                                   |
| Rubrics                        | Dev 1 | V1      | P2    | Used by AI reasoning grading      |
| Misconception catalog          | Dev 1 | V1      | P2    |                                   |
| Viva questions                 | Dev 1 | V1      | P1    | 4 per task                        |
| Transfer task design           | Dev 1 | V1      | P1    | AI-off                            |
| Content generation pipeline    | Dev 1 | V1      | P2    | Offline, human-validated          |
| Content health                 | Dev 1 | V2      | P3    | Variant quality signals           |

## 5. API — `apps/api/` (Dev 2)

| Feature                     | Owner | Version | Phase | Notes                             |
| --------------------------- | ----- | ------- | ----- | --------------------------------- |
| Authentication integration  | Dev 2 | V1      | P1    |                                   |
| Sessions                    | Dev 2 | V1      | P1    |                                   |
| Attempts                    | Dev 2 | V1      | P1    | Attempt-centered design (ADR-004) |
| Submissions                 | Dev 2 | V1      | P1    |                                   |
| Evaluation result endpoints | Dev 2 | V1      | P1    |                                   |
| Profile APIs                | Dev 2 | V1      | P2    |                                   |
| Progress APIs               | Dev 2 | V1      | P2    |                                   |
| Authorization               | Dev 2 | V1      | P1    | No cross-learner reads            |
| Validation                  | Dev 2 | V1      | P1    |                                   |
| Rate limiting               | Dev 2 | V1      | P1    | Incl. AI usage limits             |
| Disputes                    | Dev 2 | V2      | P3    |                                   |
| Admin inbox                 | Dev 2 | V2      | P3    |                                   |
| Professor dashboard API     | Dev 2 | V2      | P3    |                                   |

## 6. Database — `packages/database/` (Dev 2)

| Feature                     | Owner | Version | Phase | Notes                           |
| --------------------------- | ----- | ------- | ----- | ------------------------------- |
| PostgreSQL schema           | Dev 2 | V1      | P1    | Model decisions are Shared      |
| Migrations                  | Dev 2 | V1      | P1    |                                 |
| Indexes                     | Dev 2 | V1      | P1    |                                 |
| Relationships + constraints | Dev 2 | V1      | P1    |                                 |
| Typed data access layer     | Dev 2 | V1      | P1    | Only place raw SQL may live     |
| Seed data (structure)       | Dev 2 | V1      | P1    | Content imports come from Dev 1 |
| Data retention              | Dev 2 | V1.x    | P3    | Submission patch expiry         |
| Backups                     | Dev 2 | V1.x    | P3    | Verified by restore             |

## 7. Evaluation — `packages/evaluator/`, `apps/worker/` (Dev 2)

| Feature                    | Owner | Version | Phase | Notes                                    |
| -------------------------- | ----- | ------- | ----- | ---------------------------------------- |
| Grading worker             | Dev 2 | V1      | P1    |                                          |
| Docker execution           | Dev 2 | V1      | P1    | Isolated, resource-limited               |
| Hidden tests               | Dev 2 | V1      | P1    | Authored with Dev 1's expected behaviour |
| Visible tests              | Dev 2 | V1      | P1    | Run locally by the CLI                   |
| Benchmarks                 | Dev 2 | V1      | P1    | For performance-type faults              |
| Evaluation pipeline        | Dev 2 | V1      | P1    | Deterministic, reproducible              |
| Resource limits + timeouts | Dev 2 | V1      | P1    |                                          |
| Grading queue              | Dev 2 | V1      | P2    |                                          |
| Retries                    | Dev 2 | V1      | P2    |                                          |
| Multiple grading workers   | Dev 2 | V1      | P2    |                                          |
| Object storage             | Dev 2 | V1      | P2    | Submission + artifact storage            |
| Postmortem grading         | Dev 2 | V3      | P5    |                                          |

## 8. AI — `packages/ai/` (Dev 2)

| Feature                        | Owner | Version | Phase | Notes                              |
| ------------------------------ | ----- | ------- | ----- | ---------------------------------- |
| LLM integration                | Dev 2 | V1      | P1    |                                    |
| Model configuration            | Dev 2 | V1      | P1    |                                    |
| Mentor API                     | Dev 2 | V1      | P1    | Grounded; must not give the answer |
| Viva API                       | Dev 2 | V1      | P1    | 4-question flow                    |
| Grounding                      | Dev 2 | V1      | P1    | Restricted to task context         |
| AI usage tracking              | Dev 2 | V1      | P1    | Tokens, cost, per-learner limits   |
| Rubric-based reasoning grading | Dev 2 | V1      | P1    | Never decides code correctness     |
| AI-off enforcement             | Dev 2 | V1      | P1    | Server-side, not just UI           |

## 9. Reference System — `reference-systems/shopverse/` (Dev 2)

| Feature                                             | Owner | Version | Phase | Notes                               |
| --------------------------------------------------- | ----- | ------- | ----- | ----------------------------------- |
| Shopverse backend                                   | Dev 2 | V1      | P1    | Realistic e-commerce backend        |
| Docker setup                                        | Dev 2 | V1      | P1    | One-command local bring-up          |
| Database + seed                                     | Dev 2 | V1      | P1    |                                     |
| Test harness                                        | Dev 2 | V1      | P1    |                                     |
| Fault injection points                              | Dev 2 | V1      | P1    | Designed with Dev 1's content needs |
| Full Shopverse (Redis, queue, worker, payment mock) | Dev 2 | V3      | P5    |                                     |
| Second reference system                             | Dev 2 | V3      | P6    |                                     |

## 10. Infrastructure — `infrastructure/` (Dev 2)

| Feature               | Owner | Version | Phase | Notes                     |
| --------------------- | ----- | ------- | ----- | ------------------------- |
| Docker / Compose      | Dev 2 | V1      | P1    |                           |
| Local dev environment | Dev 2 | V1      | P1    |                           |
| CI/CD                 | Dev 2 | V1      | P1    | Lint, type-check, test    |
| Secrets management    | Dev 2 | V1      | P1    |                           |
| Deployment            | Dev 2 | V1      | P2    | Staging first             |
| Redis + queues        | Dev 2 | V1      | P2    | Simple queue only at V1   |
| Monitoring            | Dev 2 | V1.x    | P3    | Queue depth, failure rate |
| Backups               | Dev 2 | V1.x    | P3    |                           |
| Observability         | Dev 2 | V3      | P5    |                           |
| Hosted sandbox        | Dev 2 | V3      | P5    |                           |
| Proctored AI-off      | Dev 2 | V3      | P5    |                           |

## 11. Shared Concerns

| Feature                                | Owner  | Version | Phase | Notes                                          |
| -------------------------------------- | ------ | ------- | ----- | ---------------------------------------------- |
| `packages/contracts/` type surface     | Shared | V1      | P1    | Dev 2 implements, both govern                  |
| Security review                        | Shared | V1      | P2    | Release blocker                                |
| Privacy review                         | Shared | V1      | P2    | Release blocker                                |
| E2E test suite                         | Shared | V1      | P2    | Release blocker                                |
| Project tracking (`PROJECT_STATUS.md`) | Shared | —       | —     | Updated in every feature PR                    |
| Status automation                      | Shared | Future  | —     | Documented only — `../scripts/project-status/` |

---

## Future / Not Owned Yet

These are in the product plan but have no owner assigned, because they are beyond V2.
Assign an owner in the PR that starts the work.

| Feature                      | Version | Phase |
| ---------------------------- | ------- | ----- |
| Incident templates and packs | V3      | P5    |
| Investigate mode / fix mode  | V3      | P5    |
| Python stack                 | V3      | P6    |
| Hiring assessments           | V3      | P6    |
| Verified profiles            | V3      | P6    |
| Additional tracks            | V3      | P6    |

---

## Explicitly Not Features

Never build these. See [`../PRODUCT_SPEC.md` §16](../PRODUCT_SPEC.md) and
[`../PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md).

live problem generation · generic AI tutor · mobile-first platform · Kubernetes early ·
multi-region systems · unnecessary ML · fake logs · uncontrolled AI grading ·
giant course library
