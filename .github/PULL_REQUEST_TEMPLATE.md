## What changed?

<!-- Summary of the change and why. Link the issue: Fixes #<n> -->

## Project Status Impact

<!--
REQUIRED. See CONTRIBUTING.md → PROJECT STATUS UPDATE RULE.
Name the PROJECT_STATUS.md sections you edited and what you changed them to, e.g.:

- §4 Feature Status: `API` → IN_PROGRESS, 30%
- §6 Currently In Progress: added "Attempt endpoints" (Dev 2)
- §10 Test Status: API tests 0 → 6, all passing

If there is genuinely no impact, write: "None — <one-line reason>."
Do not leave this blank and do not delete this section.
-->

## New/Changed Dependencies

<!-- New packages, services, env vars, or cross-module dependencies. "None" is a valid answer. -->

## Tests

<!-- What you added or ran, and the result. Paste failing output if anything fails. -->

## Documentation

<!-- Which docs you updated (module README, API_CONTRACT.md, DATABASE.md, CURRENT_STATE.md, ...). -->

---

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Database migration
- [ ] Contract change (`packages/contracts/`)
- [ ] Content change (skills, templates, variants)
- [ ] Documentation / project tracking only

## Domain

- [ ] **Dev 1 — Product / Frontend / Learning System**
      (`apps/web`, `apps/cli`, `packages/content`, `packages/learner-model`, `packages/selector`, `docs/product`)
- [ ] **Dev 2 — Backend / Infrastructure / Evaluation**
      (`apps/api`, `apps/worker`, `packages/database`, `packages/evaluator`, `packages/ai`, `infrastructure`, `reference-systems`)
- [ ] **Shared** (contracts, architecture, data model, security, privacy, product scope, release)

## Checklist

- [ ] `PROJECT_STATUS.md` updated in this PR (or "None" justified above)
- [ ] Code is in the correct module — no logic placed across a boundary
- [ ] Only `packages/contracts/` types are imported across module boundaries
- [ ] Tests added/updated and passing locally
- [ ] No new type errors or lint warnings
- [ ] Error states handled
- [ ] Authorization respected — no learner can read another learner's data
- [ ] No forbidden data collected (`PRIVACY.md`)
- [ ] Documentation updated
- [ ] Reviewed by the other developer

## Contract changes (if applicable)

- [ ] The shape was agreed with the other developer **before** implementation
- [ ] Types updated in `packages/contracts/`
- [ ] `API_CONTRACT.md` / `EVENT_CONTRACT.md` updated
- [ ] Migration plan stated for any breaking change

## Database changes (if applicable)

- [ ] New migration file in `packages/database/migrations/` (no existing migration modified)
- [ ] Migration tested forward
- [ ] Backward-compatible, or a multi-step plan is documented
- [ ] `DATABASE.md` updated
- [ ] Data-model change agreed jointly (shared responsibility)

## Content changes (if applicable)

- [ ] Content validation passes: applies cleanly / fails without fix / passes with fix
- [ ] Hint ladder complete
- [ ] Viva questions present
- [ ] Counts updated in `PROJECT_STATUS.md` §1 and `CURRENT_STATE.md`

## AI changes (if applicable)

- [ ] AI does not decide code correctness (`AI_POLICY.md`)
- [ ] Grounding restricted to task context
- [ ] AI-off mode still enforced server-side
- [ ] Usage tracking in place
