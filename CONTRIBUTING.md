# CONTRIBUTING

Engineering Simulator is built by a **two-developer team**. Read
[`docs/TEAM.md`](./docs/TEAM.md) before your first PR, and
[`docs/WORKFLOW.md`](./docs/WORKFLOW.md) for the day-to-day process.

Development targets the `develop` integration branch. `main` holds released, tagged versions only.

---

## PROJECT STATUS UPDATE RULE

**This is the most important rule in the repository.**

Whenever a feature is:

- **started**
- **completed**
- **blocked**
- **deferred**
- **significantly changed**

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) **MUST be updated in the same PR.**

**A feature PR is incomplete if its status is not updated.** A reviewer must reject it.

`PROJECT_STATUS.md` is part of the engineering workflow, not documentation housekeeping.
It is the only place where "how much of the product exists" is recorded, and it is worthless
the moment it stops matching reality.

### Every PR description must contain

```markdown
### What changed?

### Project Status Impact

### New/Changed Dependencies

### Tests

### Documentation
```

### What goes in "Project Status Impact"

Name the exact sections of `PROJECT_STATUS.md` you edited and what you changed them to:

```markdown
### Project Status Impact

- §4 Feature Status: `API` → IN_PROGRESS, 30%
- §6 Currently In Progress: added "Attempt endpoints" (Dev 2)
- §10 Test Status: API tests 0 → 6, all passing
```

If the PR genuinely has no status impact (a typo fix, a comment, a formatting change), write:

```markdown
### Project Status Impact

None — <one-line reason>.
```

Do not leave the section blank, and do not delete it.

### Which sections to touch

| You did this         | Update these sections                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Started a feature    | §4 (→ `IN_PROGRESS`), §6                                                |
| Finished a feature   | §4 (→ `DONE`/`REVIEW`/`TESTING`, %), §5, §6 (remove it), §1 percentages |
| Hit a blocker        | §4 (→ `BLOCKED`, Blocked By), §7 (full blocker entry)                   |
| Deferred something   | §4 (→ `DEFERRED`), §8 if priorities shifted                             |
| Changed scope        | §4, §8, and `PRODUCT_SPEC.md` in a **separate** agreed PR               |
| Added or fixed tests | §10                                                                     |
| Deployed anything    | §11                                                                     |
| Created known debt   | §9                                                                      |

Conflicts in `PROJECT_STATUS.md` are resolved by **keeping both developers' edits**.
Never overwrite the other developer's status rows.

---

## Workflow Summary

```
Product decision → Issue → Assign Dev 1 or Dev 2 → Define contract changes →
Implement → Test → Update docs → Update PROJECT_STATUS.md → PR → Review →
Merge → Update CHANGELOG if release-related
```

Full detail: [`docs/WORKFLOW.md`](./docs/WORKFLOW.md).

---

## Branch Naming

| Pattern              | Use                           |
| -------------------- | ----------------------------- |
| `feat/<area>/<name>` | New feature                   |
| `fix/<area>/<name>`  | Bug fix                       |
| `content/<name>`     | Skills, templates, variants   |
| `db/<name>`          | Database migrations           |
| `contract/<name>`    | `packages/contracts/` changes |
| `docs/<name>`        | Documentation only            |

`<area>` matches an `area:` label — see [`.github/LABELS.md`](./.github/LABELS.md).

---

## Contract Changes

`packages/contracts/` is implemented by Developer 2 and **governed jointly**.

1. Agree the shape with the other developer **before** writing implementation code.
2. Change the contract in its own small PR.
3. Update [`API_CONTRACT.md`](./API_CONTRACT.md) / [`EVENT_CONTRACT.md`](./EVENT_CONTRACT.md).
4. Then implement both sides, in parallel.

Never break a contract without a migration plan. Never edit contracts inside a feature PR.

---

## Database Changes

1. Add a migration in `packages/database/migrations/` — never modify an existing one.
2. Update [`DATABASE.md`](./DATABASE.md).
3. Add or update the typed access function in `packages/database/src/`.
4. Get review from the other developer. Data-model decisions are a **shared** responsibility
   even though Developer 2 implements them.

---

## Content Changes

1. Author in `packages/content/` following [`CONTENT_AUTHORING.md`](./CONTENT_AUTHORING.md).
2. Run content validation — a variant is not real until it applies cleanly, fails without the
   fix, and passes with the fix.
3. Record the new counts in `PROJECT_STATUS.md` §1 and `CURRENT_STATE.md`.

---

## Review Rules

- Every PR is reviewed by **the other developer**. There are only two of us; review is the only
  safety net.
- No self-merge for anything touching contracts, the data model, security, privacy, or product
  scope.
- The reviewer checks the Project Status Impact section, not just the code.

See the review matrix in [`docs/TEAM.md`](./docs/TEAM.md#review-matrix).

---

## Issues

Use the templates in [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE).
Label every issue with one `area:`, one `priority:`, and one `phase:` label
([`.github/LABELS.md`](./.github/LABELS.md)). Assign to Dev 1 or Dev 2 per
[`docs/DEVELOPER_MAP.md`](./docs/DEVELOPER_MAP.md).

---

## Before You Build Anything

Check it is in scope for the **current** version:

- [`PRODUCT_SPEC.md` §12](./PRODUCT_SPEC.md) — what V1 is, strictly
- [`PRODUCT_SPEC.md` §16](./PRODUCT_SPEC.md) — what we will never build
- [`RELEASE_PLAN.md`](./RELEASE_PLAN.md) — what this version excludes
- [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md) — the product principles

If it is out of scope, open an issue instead of writing code.
