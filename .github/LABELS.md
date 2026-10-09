# GitHub Labels

The label taxonomy for Engineering Simulator. With two developers, labels are how we keep the
issue list readable — an unlabelled issue is effectively invisible.

**Every issue gets exactly one `area:`, one `priority:`, and one `phase:` label.**
`type:` is set automatically by the issue template.

---

## `area:` — which module

One per issue. The area implies the owner (see [`../docs/DEVELOPER_MAP.md`](../docs/DEVELOPER_MAP.md)).

| Label                | Module                                         | Owner |
| -------------------- | ---------------------------------------------- | ----- |
| `area:web`           | `apps/web/`                                    | Dev 1 |
| `area:cli`           | `apps/cli/`                                    | Dev 1 |
| `area:content`       | `packages/content/`                            | Dev 1 |
| `area:learner-model` | `packages/learner-model/`                      | Dev 1 |
| `area:selector`      | `packages/selector/`                           | Dev 1 |
| `area:api`           | `apps/api/`                                    | Dev 2 |
| `area:database`      | `packages/database/`                           | Dev 2 |
| `area:evaluator`     | `packages/evaluator/`, `apps/worker/`          | Dev 2 |
| `area:ai`            | `packages/ai/`                                 | Dev 2 |
| `area:infra`         | `infrastructure/`, `reference-systems/`, CI/CD | Dev 2 |

If an issue needs two areas, it is a contract change: split it at the boundary.

---

## `priority:` — what gets done first

| Label         | Meaning                                                               | Response                  |
| ------------- | --------------------------------------------------------------------- | ------------------------- |
| `priority:p0` | Learners blocked, data at risk, or grading is producing wrong results | Drop current work         |
| `priority:p1` | A core loop step is broken or the current sprint depends on it        | This sprint               |
| `priority:p2` | Important but not urgent                                              | This phase                |
| `priority:p3` | Nice to have                                                          | When convenient, or never |

Grading correctness is always at least `p1`. A wrong evaluation result corrupts a learner's
evidence record, which is the product.

---

## `phase:` — which version

| Label          | Meaning                                                        |
| -------------- | -------------------------------------------------------------- |
| `phase:v1`     | In V1 scope ([`../PRODUCT_SPEC.md` §12](../PRODUCT_SPEC.md))   |
| `phase:v2`     | First expansion after V1 is proven ([§14](../PRODUCT_SPEC.md)) |
| `phase:future` | V3 and beyond ([§15](../PRODUCT_SPEC.md))                      |

A `phase:future` issue is a parking space, not a plan. Do not work on one while `phase:v1`
issues are open.

---

## `type:` — set by the issue template

| Label               | Template                           |
| ------------------- | ---------------------------------- |
| `type:feature`      | `ISSUE_TEMPLATE/feature.md`        |
| `type:bug`          | `ISSUE_TEMPLATE/bug.md`            |
| `type:architecture` | `ISSUE_TEMPLATE/architecture.md`   |
| `type:content`      | `ISSUE_TEMPLATE/content.md`        |
| `type:tech-debt`    | `ISSUE_TEMPLATE/technical-debt.md` |

---

## `status:` — optional workflow state

Use only when the status is not obvious from assignment and the issue being open.
The authoritative feature status lives in [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) §4.

| Label                   | Meaning                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `status:blocked`        | Cannot proceed — must also appear in `PROJECT_STATUS.md` §7          |
| `status:needs-decision` | Waiting on a joint decision by both developers                       |
| `status:needs-contract` | Waiting on a `packages/contracts/` change to land first              |
| `status:deferred`       | Consciously postponed — must be `DEFERRED` in `PROJECT_STATUS.md` §4 |

---

## Creating the labels

Run once per repository, with the `gh` CLI authenticated:

```bash
for l in web:0366d6 cli:0366d6 content:0366d6 learner-model:0366d6 selector:0366d6 api:5319e7 database:5319e7 evaluator:5319e7 ai:5319e7 infra:5319e7; do gh label create "area:${l%%:*}" --color "${l##*:}" --force; done
```

```bash
gh label create priority:p0 --color b60205 --force && gh label create priority:p1 --color d93f0b --force && gh label create priority:p2 --color fbca04 --force && gh label create priority:p3 --color c2e0c6 --force
```

```bash
gh label create phase:v1 --color 0e8a16 --force && gh label create phase:v2 --color bfdadc --force && gh label create phase:future --color ededed --force
```

```bash
gh label create type:feature --color a2eeef --force && gh label create type:bug --color d73a4a --force && gh label create type:architecture --color 7057ff --force && gh label create type:content --color f9d0c4 --force && gh label create type:tech-debt --color e4e669 --force
```

```bash
gh label create status:blocked --color b60205 --force && gh label create status:needs-decision --color fef2c0 --force && gh label create status:needs-contract --color fef2c0 --force && gh label create status:deferred --color ededed --force
```

Blue `area:` labels are Dev 1's domain; purple are Dev 2's. That is the only visual cue needed
on a two-person board.
