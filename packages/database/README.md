# packages/database — Database Access Layer

**Owner:** Developer 3 (Database)
**Tech:** PostgreSQL 16, TypeScript

---

## Purpose

- Defines and owns the PostgreSQL schema
- Manages all database migrations
- Provides typed database access functions used by all other packages and apps
- Defines seed data for development and testing
- Enforces data integrity through constraints and indexes

---

## Structure

```
packages/database/
├── README.md
├── package.json
├── tsconfig.json
├── migrations/
│   └── .gitkeep                       # Migrations go here
├── schema/
│   ├── 01-authored-knowledge.sql      # skills, skill_edges, task_templates, fault_patterns, reference_systems
│   ├── 02-generated-content.sql       # variants, rubrics
│   ├── 03-learner-state.sql           # learners, skill_states, misconceptions, misconception_hits
│   ├── 04-activity.sql                # sessions, attempts, submissions, evaluations, evidence_events, hint_events, viva_records
│   └── 05-operations.sql              # item_stats, flags, disputes, ai_calls, weekly_reports
└── src/
    ├── index.ts                       # Exports all public DB functions
    ├── client.ts                      # PostgreSQL connection setup
    ├── learners.ts                    # CRUD for learners
    ├── skills.ts                      # Read skills and skill_edges
    ├── skill-states.ts                # Read/write skill_states
    ├── variants.ts                    # Read variants
    ├── sessions.ts                    # CRUD for sessions
    ├── attempts.ts                    # CRUD for attempts
    ├── submissions.ts                 # Create submissions, update status
    ├── evaluations.ts                 # Create evaluations
    ├── evidence-events.ts             # Append evidence events
    ├── hint-events.ts                 # Append hint events
    ├── viva-records.ts                # CRUD for viva records
    ├── ai-calls.ts                    # Append AI call logs
    ├── flags.ts                       # Create flags
    ├── disputes.ts                    # Create disputes
    └── seed/
        ├── index.ts                   # Run all seed scripts
        ├── skills.ts                  # Seed skill data
        └── reference-systems.ts      # Seed reference system metadata
```

---

## Responsibilities

| Task | Owner |
|---|---|
| Schema definition | Developer 3 |
| Migrations | Developer 3 |
| Index design | Developer 3 |
| Constraints + relationships | Developer 3 |
| Typed DB access functions | Developer 3 |
| Seed data (structure) | Developer 3 |
| Seed data (content) | Developer 4 (content imports) |
| RLS policies | Developer 3 (with Dev 10) |
| Data retention jobs | Developer 3 [Phase 3] |

---

## Database Access Rules

1. No raw SQL in `apps/api`, `apps/worker`, or any `packages/*` other than `packages/database`.
2. All database access goes through the typed functions exported from `packages/database/src/index.ts`.
3. Database functions are thin wrappers — no business logic in DB functions.
4. Business logic lives in the service layer (`apps/api/src/services/`) or in the relevant package.

---

## Migration Rules

1. Migration files live in `packages/database/migrations/`.
2. Named: `YYYYMMDD_HHMMSS_<description>.sql`
3. Every migration requires review from Developer 3.
4. Never modify an existing migration — always add a new one.
5. Migrations must be backward-compatible where possible.
6. Breaking changes (drop column, rename) require a multi-step migration plan.

---

## Immutability Rules

1. `variants` with `status = 'published'` are never updated — only new versions are created.
2. `evidence_events` are append-only.
3. `evaluations` are append-only.
4. `submissions` are append-only.

These rules are enforced by DB-level triggers or application-level checks (to be decided during implementation).

---

## Dependencies

This package has **no** dependencies on other internal packages.
It depends only on the PostgreSQL client library.

Other packages depend on this one, not the other way around.

---

## What This Developer Must NOT Implement

- Business logic in DB functions
- API route handlers
- Grading logic
- Mastery calculations
- Content authoring
- Any AI calls
- Admin dashboard [FUTURE]

---

## Testing Requirements

- Migration tests: run migrations on a clean DB, verify schema.
- Query tests: unit-test DB functions against a real PostgreSQL test database.
- Seed tests: verify seed data loads correctly.
- Immutability tests: verify published variants cannot be overwritten.
