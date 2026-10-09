# Database Design

**Owner:** Developer 3 (Database)
**Tech:** PostgreSQL 16

> **Rule:** Published variant records are immutable. A fix creates a new version.

---

## Overview

All tables live in the `public` schema unless noted.
Row-level security (RLS) is enforced via Supabase.

---

## Groups

### AUTHORED KNOWLEDGE
Authored offline by Developer 4 (Content). Immutable once published.

### GENERATED CONTENT
Created via offline tooling. Immutable once published.

### LEARNER STATE
One record per learner per skill. Updated by the Learner Model.

### ACTIVITY
Append-only records. Never update; always insert.

### OPERATIONS
Internal admin and quality records.

---

## AUTHORED KNOWLEDGE

### `skills`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `slug` | TEXT UNIQUE | e.g. `db-query-design` |
| `name` | TEXT | Human-readable |
| `description` | TEXT | |
| `track` | TEXT | `backend-node` |
| `status` | TEXT | `draft \| active \| paused \| retired` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Relationships:** Skills are linked to each other via `skill_edges`.

---

### `skill_edges`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `from_skill_id` | UUID FK → skills | Prerequisite |
| `to_skill_id` | UUID FK → skills | Depends on from_skill |
| `edge_type` | TEXT | `prerequisite \| related` |

---

### `task_templates`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `slug` | TEXT UNIQUE | |
| `name` | TEXT | |
| `description` | TEXT | Learning objective |
| `skill_id` | UUID FK → skills | Primary skill |
| `supporting_skill_ids` | UUID[] | Supporting skills |
| `mode` | TEXT | `debug \| build \| fix \| investigate` |
| `difficulty_range` | INT4RANGE | e.g. `[1,3]` |
| `status` | TEXT | `draft \| active \| paused \| retired` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### `fault_patterns`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `slug` | TEXT UNIQUE | |
| `name` | TEXT | |
| `description` | TEXT | |
| `pattern_type` | TEXT | e.g. `n-plus-one \| missing-index \| transaction-missing` |
| `reference_system_id` | UUID FK → reference_systems | |
| `status` | TEXT | `draft \| active \| retired` |
| `created_at` | TIMESTAMPTZ | |

---

### `reference_systems`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | TEXT | e.g. `shopverse` |
| `description` | TEXT | |
| `docker_image` | TEXT | |
| `version` | TEXT | |
| `status` | TEXT | `active \| deprecated` |
| `created_at` | TIMESTAMPTZ | |

---

## GENERATED CONTENT

### `variants`

> **Immutable once published. A fix creates a new version (new row, new ID).**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `template_id` | UUID FK → task_templates | |
| `reference_system_id` | UUID FK → reference_systems | |
| `version` | INTEGER | Starts at 1, increments on fix |
| `previous_version_id` | UUID FK → variants \| NULL | Links version chain |
| `title` | TEXT | |
| `narrative` | TEXT | Learner-facing story |
| `instructions` | TEXT (markdown) | |
| `fact_sheet` | TEXT (markdown) | Verified facts for mentor |
| `code_state` | JSONB | Initial code state reference |
| `hint_ladder` | JSONB | Array of hint objects |
| `explanation` | TEXT | Post-task explanation |
| `misconception_ids` | UUID[] | Related misconceptions |
| `viva_question_ids` | UUID[] | Ordered viva questions |
| `rubric_id` | UUID FK → rubrics \| NULL | |
| `difficulty` | INTEGER | 1–5 |
| `estimated_minutes` | INTEGER | |
| `status` | TEXT | `draft \| review \| published \| paused \| retired` |
| `published_at` | TIMESTAMPTZ \| NULL | |
| `created_at` | TIMESTAMPTZ | |

**Key rule:** `published_at` is set once. After publish, this row is read-only.

---

## LEARNER STATE

### `learners`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Matches Supabase auth UID |
| `email` | TEXT UNIQUE | |
| `display_name` | TEXT | |
| `goal` | TEXT | |
| `current_role` | TEXT | |
| `years_experience` | INTEGER | |
| `target_stack` | TEXT[] | |
| `onboarded_at` | TIMESTAMPTZ \| NULL | |
| `created_at` | TIMESTAMPTZ | |

---

### `skill_states`

One row per (learner, skill). Updated by Learner Model on each evidence event.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `learner_id` | UUID FK → learners | |
| `skill_id` | UUID FK → skills | |
| `mastery` | FLOAT | 0.0 – 1.0 |
| `alpha` | FLOAT | Beta distribution alpha param |
| `beta` | FLOAT | Beta distribution beta param |
| `evidence_count` | INTEGER | |
| `last_evidence_at` | TIMESTAMPTZ \| NULL | |
| `updated_at` | TIMESTAMPTZ | |

**Unique constraint:** `(learner_id, skill_id)`

---

### `misconceptions`

Authored catalog of known misconceptions (authored by Developer 4).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `slug` | TEXT UNIQUE | |
| `description` | TEXT | |
| `skill_id` | UUID FK → skills | |
| `status` | TEXT | `active \| retired` |

---

### `misconception_hits`

One row per detected misconception instance per learner.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `learner_id` | UUID FK → learners | |
| `misconception_id` | UUID FK → misconceptions | |
| `attempt_id` | UUID FK → attempts | |
| `detected_at` | TIMESTAMPTZ | |
| `source` | TEXT | `viva \| structured-answer \| ai-classification` |

---

## ACTIVITY

> All activity tables are append-only. No updates; only inserts.

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `learner_id` | UUID FK → learners | |
| `mode` | TEXT | `practice \| debug \| build \| transfer` |
| `started_at` | TIMESTAMPTZ | |
| `ended_at` | TIMESTAMPTZ \| NULL | |

---

### `attempts`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `session_id` | UUID FK → sessions | |
| `learner_id` | UUID FK → learners | |
| `variant_id` | UUID FK → variants | |
| `status` | TEXT | See lifecycle below |
| `selector_decision` | JSONB | `SelectorDecision` snapshot |
| `hints_used` | INTEGER | |
| `submissions_count` | INTEGER | |
| `started_at` | TIMESTAMPTZ \| NULL | |
| `submitted_at` | TIMESTAMPTZ \| NULL | |
| `completed_at` | TIMESTAMPTZ \| NULL | |
| `created_at` | TIMESTAMPTZ | |

**Status values:** `created \| started \| working \| submitted \| grading \| evaluated \| viva \| transfer \| completed \| abandoned`

---

### `submissions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `attempt_id` | UUID FK → attempts | |
| `learner_id` | UUID FK → learners | |
| `patch` | TEXT | Unified diff |
| `structured_answers` | JSONB | |
| `client_checksum` | TEXT | |
| `status` | TEXT | `queued \| grading \| complete \| failed \| timeout` |
| `submitted_at` | TIMESTAMPTZ | |

---

### `evaluations`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `submission_id` | UUID FK → submissions | |
| `attempt_id` | UUID FK → attempts | |
| `patch_valid` | BOOLEAN | |
| `public_tests_passed` | INTEGER | |
| `public_tests_total` | INTEGER | |
| `hidden_tests_passed` | INTEGER | |
| `hidden_tests_total` | INTEGER | |
| `benchmarks_passed` | BOOLEAN \| NULL | |
| `structured_answers_result` | JSONB | |
| `rubric_results` | JSONB \| NULL | |
| `passed` | BOOLEAN | Overall result |
| `score` | FLOAT | 0.0 – 1.0 |
| `created_at` | TIMESTAMPTZ | |

---

### `evidence_events`

Append-only. Fed to Learner Model to update `skill_states`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `learner_id` | UUID FK → learners | |
| `attempt_id` | UUID FK → attempts | |
| `skill_id` | UUID FK → skills | |
| `evidence_type` | TEXT | `practice \| transfer \| diagnostic` |
| `passed` | BOOLEAN | |
| `score` | FLOAT | |
| `difficulty` | INTEGER | Variant difficulty at time |
| `task_mode` | TEXT | |
| `occurred_at` | TIMESTAMPTZ | |

---

### `hint_events`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `attempt_id` | UUID FK → attempts | |
| `learner_id` | UUID FK → learners | |
| `hint_index` | INTEGER | |
| `requested_at` | TIMESTAMPTZ | |

---

### `viva_records`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `attempt_id` | UUID FK → attempts | |
| `learner_id` | UUID FK → learners | |
| `questions` | JSONB | Ordered question list |
| `answers` | JSONB | Learner answers |
| `rubric_results` | JSONB \| NULL | AI rubric results |
| `status` | TEXT | `in-progress \| complete` |
| `started_at` | TIMESTAMPTZ | |
| `completed_at` | TIMESTAMPTZ \| NULL | |

---

## OPERATIONS

### `item_stats`

Aggregated statistics per variant. Updated after each grading.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `variant_id` | UUID FK → variants | |
| `attempts_count` | INTEGER | |
| `pass_rate` | FLOAT | |
| `avg_score` | FLOAT | |
| `avg_hints_used` | FLOAT | |
| `avg_time_minutes` | FLOAT | |
| `calibrated_difficulty` | FLOAT \| NULL | Derived from pass rate |
| `updated_at` | TIMESTAMPTZ | |

---

### `flags`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `attempt_id` | UUID FK → attempts | |
| `learner_id` | UUID FK → learners | |
| `type` | TEXT | `incorrect-test \| unclear-instructions \| wrong-answer \| other` |
| `description` | TEXT | |
| `status` | TEXT | `open \| reviewing \| resolved \| dismissed` |
| `created_at` | TIMESTAMPTZ | |

---

### `disputes`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `evaluation_id` | UUID FK → evaluations | |
| `learner_id` | UUID FK → learners | |
| `reason` | TEXT | |
| `evidence_description` | TEXT | |
| `status` | TEXT | `open \| reviewing \| upheld \| dismissed` |
| `created_at` | TIMESTAMPTZ | |

---

### `ai_calls`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `attempt_id` | UUID FK → attempts \| NULL | |
| `purpose` | TEXT | `mentor \| viva \| rubric_grading \| weekly_report \| offline` |
| `model` | TEXT | e.g. `gpt-4o-2024-11-20` |
| `prompt_name` | TEXT | |
| `prompt_version` | TEXT | |
| `input_tokens` | INTEGER | |
| `output_tokens` | INTEGER | |
| `latency_ms` | INTEGER | |
| `cost_usd` | FLOAT | |
| `created_at` | TIMESTAMPTZ | |

---

### `weekly_reports`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `learner_id` | UUID FK → learners | |
| `week_of` | DATE | Monday of the week |
| `summary` | TEXT | AI-generated, grounded in data |
| `data_snapshot` | JSONB | Raw data used to generate summary |
| `created_at` | TIMESTAMPTZ | |

---

## Indexes (Planned)

| Table | Index | Reason |
|---|---|---|
| `attempts` | `(learner_id, status)` | Fetch active attempts |
| `attempts` | `(session_id)` | Session attempts lookup |
| `skill_states` | `(learner_id, skill_id)` | Mastery lookup |
| `evidence_events` | `(learner_id, skill_id, occurred_at)` | Evidence history |
| `submissions` | `(attempt_id, status)` | Grading status polling |
| `evaluations` | `(submission_id)` | Result lookup |
| `hint_events` | `(attempt_id)` | Hint count per attempt |

---

## Immutability Rules

1. `variants` with `status = 'published'` are **never updated** — only new versions are created.
2. `evidence_events` are append-only — never updated or deleted.
3. `evaluations` are append-only — disputes create a separate record, not an update.
4. `submissions` are append-only.

---

## Migration Conventions

- Files in `packages/database/migrations/`
- Named: `YYYYMMDD_HHMMSS_<description>.sql`
- Every migration reviewed by Developer 3 (Database owner)
- Never modify existing migrations — always add new ones
