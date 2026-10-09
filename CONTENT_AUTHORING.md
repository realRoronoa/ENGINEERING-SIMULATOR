# Content Authoring Guide

**Owner:** Developer 4 (Content)
**Status:** Active

---

## Overview

All learner-facing content is **human-authored and pre-validated**.

> Principle 1: Humans author knowledge; machines create variety.
> Principle 2: Never generate a new problem live while a learner is waiting.

---

## Content Lifecycle

```
Draft → Generate → Validate → Review → Publish → Active → Paused → Retired
```

| Status     | Meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `draft`    | Author is working on it. Not visible to anyone.                    |
| `generate` | AI-assisted drafting in progress (offline).                        |
| `validate` | Automated validation scripts running.                              |
| `review`   | Human review required before publish.                              |
| `publish`  | Approved. Being published (immutable after this).                  |
| `active`   | Live. Visible to selector and learners.                            |
| `paused`   | Temporarily removed from selection. Learners who have it continue. |
| `retired`  | Permanently removed. No new learners assigned.                     |

**Key rule:** No learner ever sees content with status `draft`, `generate`, `validate`, or `review`.

---

## Content Units

### Skill

Represents a specific backend engineering capability.

```yaml
id: uuid
slug: db-query-design
name: Database Query Design
description: >
  The ability to write correct, efficient SQL queries in the context
  of a production-like PostgreSQL schema.
track: backend-node
prerequisites:
  - sql-basics
status: active
```

---

### TaskTemplate

Describes a reusable task pattern (learning objective + mode).

```yaml
id: uuid
slug: n-plus-one-detection
name: Detect and Fix N+1 Query
description: >
  Learner must identify an N+1 query in the reference system,
  explain why it causes performance degradation, and apply a fix.
skill_id: db-query-design
supporting_skill_ids: []
mode: debug
difficulty_range: [1, 3]
status: active
```

---

### Variant

A concrete, learner-facing instance of a TaskTemplate.

```yaml
id: uuid
template_id: uuid
reference_system_id: uuid (shopverse)
version: 1
title: 'Shopverse: Products endpoint is slow'
narrative: >
  The team has received a Datadog alert. The GET /products endpoint
  is taking 2.3s on average. Your job is to investigate and fix it.
instructions: |
  1. Reproduce the issue by running the load test.
  2. Identify the query causing the problem.
  3. Apply the minimal fix.
  4. Verify the load test passes.
fact_sheet: |
  ## Shopverse Products
  The `products` table has 10,000 rows.
  The `GET /products` endpoint fetches products with their category names.
  Category names are fetched via a separate `categories` table.
  [... verified facts ...]
difficulty: 2
estimated_minutes: 25
hint_ladder:
  - index: 1
    text: 'Have you tried running the load test first to see the actual latency?'
  - index: 2
    text: 'Check the query log. How many queries are being executed per request?'
  - index: 3
    text: 'The problem is in the product listing code. Look at how categories are fetched.'
explanation: |
  This is a classic N+1 query. The endpoint fetches all products,
  then for each product makes a separate database call to fetch its category.
  The fix is to use a JOIN or a single lookup with an IN clause.
viva_question_ids: [uuid1, uuid2, uuid3, uuid4]
rubric_id: uuid
misconception_ids: [uuid-joins-are-always-slower]
status: active
published_at: 2024-01-15T00:00:00Z
```

---

### FaultPattern

A reusable description of an engineering failure mode.

```yaml
id: uuid
slug: n-plus-one-query
name: N+1 Query
description: >
  A loop that executes one database query per item in a collection,
  instead of fetching all required data in a single query.
pattern_type: n-plus-one
reference_system_id: uuid
injected_in: src/routes/products.ts
correct_fix: |
  Replace individual category fetches with a JOIN or batched lookup.
status: active
```

---

### ReferenceSystem

The actual codebase learners work on.

```yaml
id: uuid
name: shopverse
description: >
  A realistic Node.js/TypeScript e-commerce backend with PostgreSQL.
  Used for all Phase 1-2 backend tasks.
docker_image: eng-sim/shopverse:1.0.0
version: 1.0.0
status: active
```

---

### Rubric

Defines how reasoning/explanation is graded by AI.

```yaml
id: uuid
name: N+1 Fix Explanation Rubric
items:
  - id: uuid
    criterion: 'Learner correctly identifies that multiple queries are being executed.'
    weight: 0.4
  - id: uuid
    criterion: 'Learner explains why this causes performance degradation.'
    weight: 0.3
  - id: uuid
    criterion: 'Learner proposes the correct category of fix (JOIN or batch).'
    weight: 0.3
```

---

## Validation Rules

Every variant must pass these checks before reaching `review` status:

1. Reference fix applies cleanly to the Docker reference system.
2. All hidden tests **pass** with the fix applied.
3. All hidden tests **fail** without the fix (or with an incorrect fix).
4. Hint ladder has between 3 and 5 hints.
5. Fact sheet is reviewed against the reference codebase.
6. Viva questions are complete (at minimum 4).
7. Rubric covers at least 3 criteria if rubric-graded.
8. Estimated minutes is set.
9. Difficulty is calibrated against validator judgment.

---

## What Content Authors Must NOT Do

1. Mark content as `published` without passing automated validation.
2. Edit a published variant (create a new version instead).
3. Add fake system logs or metrics to the fact sheet.
4. Write hints that reveal the complete answer.
5. Write viva questions that can be answered without understanding the task.
6. Author content for Phase 5+ features (incidents, postmortems) — this is FUTURE.

---

## Initial Content Plan (MVP)

| Item                  | Count | Status                      |
| --------------------- | ----- | --------------------------- |
| Skills                | 12    | To be authored              |
| TaskTemplates         | 15    | To be authored              |
| Variants              | ~60   | To be drafted and validated |
| FaultPatterns         | ~20   | To be authored              |
| Rubrics               | ~15   | To be authored              |
| Viva question banks   | ~15   | To be authored              |
| Misconception catalog | ~30   | To be authored              |
