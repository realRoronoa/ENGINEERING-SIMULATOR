# CURRENT STATE

> **What is true RIGHT NOW.**
> Not what we are building ([`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)).
> Not how much is built ([`PROJECT_STATUS.md`](./PROJECT_STATUS.md)).
>
> Keep this file short. If it grows past one screen, it has become the wrong file.

**As of:** 2026-10-08

| | |
|---|---|
| **Current version** | v0.0.1 — repository scaffold |
| **Current phase** | Phase 0 — Validation |
| **Next milestone** | Phase 0 validation evidence: 3 student interviews + manual mission #1 run by hand |

### Current architecture
Monorepo (`apps/` + `packages/` + `reference-systems/` + `infrastructure/`), documented only.
Attempt-centered API design. Deterministic evaluation ahead of AI. No code implements this yet.

### Current tech stack
Node.js, TypeScript, PostgreSQL. Docker for reference-system and grading execution.
Decided and documented; **not installed, not wired, no `package.json` workspace yet.**

### Current deployed services
None. No development, staging, or production environment exists.

### Current working features
None. The repository contains documentation, architecture decisions, contracts, and ownership —
no executable product code.

### Current known bugs
None — there is no running code to have bugs.

### Current limitations
- Nothing runs; the monorepo is not installable.
- No CI pipeline.
- No database migrations.
- Local-only by design at this stage.

### Current users / testers
0

### Current content
| | Count |
|---|---:|
| Skills | 0 (12 planned for V1) |
| Task templates | 0 (15 planned for V1) |
| Variants | 0 (~60 planned for V1) |
| Reference systems | 0 running (Shopverse documented) |

### Current infrastructure
None. No Docker Compose, no Redis, no queue, no object storage, no monitoring, no backups.

### Current AI integrations
None. Provider and model configuration not yet chosen.

### Current database state
Schema designed in [`DATABASE.md`](./DATABASE.md). Zero migrations written, zero applied.

### Current blockers
None.
