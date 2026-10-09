# TEAM

Engineering Simulator is built by a **TWO-DEVELOPER TEAM**.

**Developer 1**
Product / Frontend / Learning System

**Developer 2**
Backend / Infrastructure / Evaluation

> **Packages are architectural modules, not individual developer teams.**
> There is no per-package owner. There are two people, and two domains.

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

---

## DEVELOPER 1 — Product / Frontend / Learning Experience

### Primary ownership

```
apps/web/
apps/cli/
packages/content/
packages/learner-model/
packages/selector/
docs/product/
```

### Responsibilities

**Frontend**
landing · authentication UI · onboarding · goal selection · diagnostic · skill profile ·
dashboard · task workspace · editor · terminal UI · mentor UI · hints · submission ·
evaluation results · viva · transfer · progress · weekly report

**Learning system**
skill definitions · skill graph · task templates · fault patterns · variants · hints · rubrics ·
misconceptions · learner learning state · mastery rules · selector rules

**Content**
authoring the initial 12 skills · authoring the initial task templates · designing variants ·
defining expected behaviour · defining misconceptions · defining viva questions

**CLI**
local task setup · test command · submission command · status/result commands

### Developer 1 does NOT own
- database infrastructure
- API implementation
- grading workers
- Docker grading infrastructure
- production deployment

---

## DEVELOPER 2 — Backend / Infrastructure / Evaluation

### Primary ownership

```
apps/api/
apps/worker/
packages/database/
packages/evaluator/
packages/contracts/
packages/ai/
infrastructure/
reference-systems/
```

### Responsibilities

**Backend**
authentication integration · API · sessions · attempts · submissions · evaluation results ·
profile APIs · progress APIs · authorization · validation · rate limiting

**Database**
PostgreSQL · migrations · indexes · relationships · data retention

**Evaluation**
grading worker · Docker execution · tests · hidden tests · benchmarks · evaluation pipeline ·
grading queue · retries · resource limits

**Infrastructure**
Docker · Redis · queues · deployment · CI/CD · monitoring · backups · secrets

**Reference system**
Shopverse backend · Docker setup · database · tests · fault injection points

**AI infrastructure**
LLM integration · mentor API · viva API · AI usage tracking · grounding · model configuration

### Developer 2 does NOT own
- frontend UX
- content authoring
- skill graph design
- learner experience design

---

## SHARED RESPONSIBILITY

Both developers **jointly** own:

- product decisions
- architecture
- API contracts
- database model decisions
- security
- privacy
- testing strategy
- deployment decisions
- code reviews
- GitHub issues
- release decisions
- `PROJECT_STATUS.md`
- `PRODUCT_SPEC.md`

**No major architectural decision should belong exclusively to one developer.**

`packages/contracts/` is implemented by Developer 2 but **governed jointly**: any change to a
cross-boundary type needs both developers' agreement before implementation starts.

---

## Boundary Rules

These exist so two people do not block each other.

1. **Contract first.** A cross-boundary change starts as a change to `packages/contracts/` or to
   `API_CONTRACT.md` / `EVENT_CONTRACT.md`, agreed by both, before either side implements.
2. **One editor per file per PR.** Avoid both developers editing the same core file at the same
   time. If it is unavoidable, say so in the issue first.
3. **Mock across the boundary.** Dev 1 builds against the agreed contract with a mock. Dev 2 is
   never a blocker for UI work, and vice versa.
4. **Decisions get written down.** A decision that changes the architecture becomes an ADR in
   `docs/decisions/`. A decision that changes the product goes into `PRODUCT_SPEC.md`.
5. **Both review.** Every PR is reviewed by the other developer. There is no self-merge for
   anything touching contracts, the database model, security, or the product scope.
6. **Status is not optional.** Every feature PR updates `PROJECT_STATUS.md`
   (see [`../CONTRIBUTING.md`](../CONTRIBUTING.md#project-status-update-rule)).

---

## Review Matrix

| Change type | Author | Required reviewer | Notes |
|---|---|---|---|
| Frontend / CLI | Dev 1 | Dev 2 | Correctness + contract use |
| Content / variants | Dev 1 | Dev 2 | Must pass content validation |
| Learner model / selector rules | Dev 1 | Dev 2 | Rules must be explainable |
| API / database | Dev 2 | Dev 1 | Consumer impact |
| Evaluator / worker / infra | Dev 2 | Dev 1 | Determinism + learner safety |
| AI integration | Dev 2 | Dev 1 | Grounding + `AI_POLICY.md` compliance |
| `packages/contracts/` | Either | **Both must agree before implementation** | Contract change |
| Architecture (ADR) | Either | **Both** | Joint decision |
| Product scope (`PRODUCT_SPEC.md`) | Either | **Both** | Joint decision |
| Release | Either | **Both** | Joint decision |

---

## Disagreement and Escalation

With two developers there is no tie-break by majority. Use this instead:

1. Write the disagreement into the issue — each position, in one paragraph, with its cost.
2. Check it against [`PRODUCT_SPEC.md`](../PRODUCT_SPEC.md) and the product principles in
   [`PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md). Most disagreements are resolved by scope.
3. If it is still open: **the domain owner decides, the other developer records the objection**
   in the ADR. Progress beats deadlock.
4. If it affects the product thesis or V1 scope, it is not a domain decision — it stays open
   until both agree. Nothing ships in the meantime.

---

## Related

| Question | File |
|---|---|
| What are we building? | [`../PRODUCT_SPEC.md`](../PRODUCT_SPEC.md) |
| How much is built? | [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) |
| What is true right now? | [`../CURRENT_STATE.md`](../CURRENT_STATE.md) |
| Which directory belongs to whom? | [`DEVELOPER_MAP.md`](./DEVELOPER_MAP.md) |
| How do we work day to day? | [`WORKFLOW.md`](./WORKFLOW.md) |
| What features exist, and whose are they? | [`FEATURE_INVENTORY.md`](./FEATURE_INVENTORY.md) |
