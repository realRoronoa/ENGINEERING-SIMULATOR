# WORKFLOW

> How two developers build this product without blocking each other.
>
> Ownership: [`TEAM.md`](./TEAM.md) · Directory map: [`DEVELOPER_MAP.md`](./DEVELOPER_MAP.md) ·
> PR rules: [`../CONTRIBUTING.md`](../CONTRIBUTING.md)

**Operating principle:** avoid both developers editing the same core files unnecessarily.
Coordination cost is the main risk in a two-person team — not capacity.

---

## The Workflow

```
1.  Product decision
2.  Issue created
3.  Assign Developer 1 or Developer 2
4.  Define contract changes
5.  Implement
6.  Test
7.  Update documentation
8.  Update PROJECT_STATUS.md
9.  PR
10. Review
11. Merge
12. Update CHANGELOG if release-related
```

### 1. Product decision

Does this serve the current version's scope in [`../PRODUCT_SPEC.md`](../PRODUCT_SPEC.md)?
If it is not in the current version, it does not get built now — file it and move on.
Both developers agree before work starts on anything that changes product behaviour.

### 2. Issue created

Use a template from [`../.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE).
Label it with one `area:`, one `priority:`, and one `phase:` label — see
[`../.github/LABELS.md`](../.github/LABELS.md). An unlabelled issue is invisible.

### 3. Assign Developer 1 or Developer 2

Use [`DEVELOPER_MAP.md`](./DEVELOPER_MAP.md). One assignee. If the issue genuinely needs both,
it is too big — split it at the contract boundary (see step 4).

### 4. Define contract changes

Before any implementation, if the change crosses the boundary:

- update the types in `packages/contracts/`,
- update [`../API_CONTRACT.md`](../API_CONTRACT.md) and/or
  [`../EVENT_CONTRACT.md`](../EVENT_CONTRACT.md),
- both developers agree to the shape.

The contract is agreed in one short PR of its own. Then both sides can work in parallel.

### 5. Implement

Work inside your own domain. Import shared types from `packages/contracts/` only — never
another package's internals.

### 6. Test

Per [`../TESTING_STRATEGY.md`](../TESTING_STRATEGY.md). Content changes must pass content
validation. Evaluator changes must prove determinism.

### 7. Update documentation

README of the module you changed, plus any contract or policy document the change affects.

### 8. Update `PROJECT_STATUS.md`

**Mandatory.** See [the PROJECT STATUS UPDATE RULE](../CONTRIBUTING.md#project-status-update-rule).
A feature PR without a status update is incomplete and will not be approved.

### 9. PR

Fill in all five sections of the PR template: What changed · Project Status Impact ·
New/Changed Dependencies · Tests · Documentation.

### 10. Review

The other developer reviews. Always. With two people, review is the only safety net —
there is no third person to catch a mistake later.

### 11. Merge

Squash-merge into `develop`. Delete the branch.

### 12. Update `CHANGELOG.md` if release-related

Feature PRs update `PROJECT_STATUS.md`. Release PRs update `CHANGELOG.md`.

---

## Cross-Domain Features

Most valuable features span both domains. Split them this way:

```
          ┌───────────────────────────────┐
          │  1. Agree the contract        │  ← both developers, one small PR
          └───────────────┬───────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
  2a. Dev 2 implements              2b. Dev 1 builds Web UI,
      the API & CLI against             against the contract,
      contract                          using a mock
        │                                   │
        └─────────────────┬─────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │  3. Integrate and test together│
          └───────────────────────────────┘
```

Rules:

1. **Define the contract first** — payload shapes, error cases, status codes.
2. Dev 2 mocks or implements the API.
3. Dev 1 builds against the contract or the mock — never waits for the real endpoint.
4. Integrate and test together, then both update `PROJECT_STATUS.md` in the integration PR.

If Dev 1 is blocked waiting on Dev 2 (or the reverse), the contract step was skipped.

---

## Branching

| Branch               | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `main`               | Released, tagged versions only                         |
| `develop`            | Integration branch — default target for PRs            |
| `feat/<area>/<name>` | New feature                                            |
| `fix/<area>/<name>`  | Bug fix                                                |
| `content/<name>`     | Skills, templates, variants (Dev 1)                    |
| `db/<name>`          | Migrations (Dev 2)                                     |
| `contract/<name>`    | `packages/contracts/` changes (either, agreed jointly) |
| `docs/<name>`        | Documentation only                                     |

`<area>` matches an `area:` label: `web`, `api`, `database`, `evaluator`, `content`,
`learner-model`, `selector`, `ai`, `cli`, `infra`.

---

## Avoiding Collisions

Files both developers are tempted to edit at once, and how to handle them:

| File                                  | Rule                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `PROJECT_STATUS.md`                   | Each PR edits only its own rows/sections. Resolve conflicts by keeping both edits — never overwrite the other developer's status. |
| `PRODUCT_SPEC.md`                     | Changed only in a dedicated PR, agreed first. Never edited inside a feature PR.                                                   |
| `packages/contracts/`                 | Dedicated contract PR, agreed first. Never edited inside a feature PR.                                                            |
| `ARCHITECTURE.md` / `docs/decisions/` | One ADR per decision, one author, both review.                                                                                    |
| `CHANGELOG.md`                        | Release PRs only.                                                                                                                 |
| `packages/shared`                     | Prefer not to. If a type crosses a boundary it belongs in `contracts`.                                                            |

---

## Weekly Rhythm

A two-person team does not need ceremony. It needs two fixed points:

**Start of week — 20 minutes**

- Read `PROJECT_STATUS.md` §3 (current sprint) and §7 (blocked).
- Each developer names the one thing they will finish this week.
- Clear anything in §7 or escalate it.

**End of week — 20 minutes**

- Update §5 (completed this week), §6 (in progress), §8 (next priorities).
- Update `CURRENT_STATE.md` if anything about the live system changed.
- Decide whether the sprint goal in §3 was met, and say so plainly.

Anything else is optional. These two are not.

---

## Definition of Done

A feature is done when all of the following are true:

- [ ] Code implemented inside the correct module
- [ ] Tests exist and pass (unit + integration as applicable)
- [ ] Contract updated if the boundary changed
- [ ] Database migration present and tested if the schema changed
- [ ] Documentation updated
- [ ] Error states handled
- [ ] Authorization boundary respected — no learner can read another learner's data
- [ ] No forbidden data collected ([`../PRIVACY.md`](../PRIVACY.md))
- [ ] `PROJECT_STATUS.md` updated
- [ ] Reviewed and approved by the other developer

---

## Implementation Starting Sequence

### Step 1 — Development foundation

**Owner:** Developer 2
Establish package management, workspaces, TypeScript, linting, testing, environment configuration, and basic CI.

### Step 2 — Shared contracts

**Owner:** Developer 2, with Developer 1 reviewing learner-facing types
Define API and event contracts in `packages/contracts` before any dependent implementation begins.
