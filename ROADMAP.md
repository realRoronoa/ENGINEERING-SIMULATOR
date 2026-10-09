# ROADMAP

Phase 0 → Phase 6. Each phase states its goal, who leads, what it delivers, and how we know it
is finished.

- Live progress → [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) §2
- Version mapping → [`RELEASE_PLAN.md`](./RELEASE_PLAN.md)
- Product definition → [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)

| Phase | Name                 | Version band | Status          |
| ----- | -------------------- | ------------ | --------------- |
| 0     | Validation           | pre-v0.1     | Completed       |
| 1     | Monorepo & Prototype | v0.1 – v0.2  | **In Progress** |
| 2     | First usable product | v1.0         | Not started     |
| 3     | First 100 users      | v1.x – v2.0  | Not started     |
| 4     | Personalization      | v2.0         | Not started     |
| 5     | Production debugging | v3           | Not started     |
| 6     | Scale                | v3+          | Not started     |

---

## Phase 0 — Validation _(current)_

**Goal:** find out whether the problem and the loop are real, before building a platform.

**Lead:** Dev 1 (research and mission design) · Dev 2 (technical feasibility spike)

**Deliverables**

- Student interviews
- Faculty interviews
- Hiring manager interviews
- First manual mission (run by hand, no platform)
- Initial learner testing
- Practice vs transfer evidence

**Done when:** one manual mission has been run end-to-end with a real learner, and we have a
first observation about whether practice performance predicts AI-off transfer performance.

**Not in this phase:** any product feature. Writing application code here is premature.

---

## Phase 1 — Prototype

**Goal:** prove the technical pipeline and put the loop in front of a handful of learners.

**Lead:** Dev 2 (pipeline) · Dev 1 (tasks, UI, viva)

**Deliverables**

- Shopverse reference system
- 3 debug tasks
- Hidden tests
- CLI
- Basic web interface
- Mentor
- Viva
- Transfer task
- Results page
- Database
- Grading worker

**Done when:** 5 learners each complete practice → evaluation → viva → transfer without a
developer fixing the platform mid-session.

Maps to **v0.1** (internal) and **v0.2** (learner prototype).

---

## Phase 2 — First Usable Product

**Goal:** the smallest product a learner can use alone, repeatedly.

**Lead:** Dev 1 (content, learning system, UI) · Dev 2 (API, grading, infrastructure)

**Deliverables**

- 12 skills
- 15 templates
- ~60 variants
- Diagnostic
- Skill profile
- Hint ladder
- Beta mastery model
- Rule-based selector
- Misconception classifier
- Learner flags
- Content generation pipeline (offline, human-validated)
- Queue
- Multiple grading workers
- Object storage

**Done when:** the V1 success criteria in [`PRODUCT_SPEC.md` §13](./PRODUCT_SPEC.md) hold —
the full loop works unaided **and** transfer performance improves after practice.

Maps to **v1.0**.

---

## Phase 3 — First 100 Users

**Goal:** survive real usage and the first institution.

**Lead:** Dev 2 (operations) · Dev 1 (content health, reporting)

**Deliverables**

- College pilot
- Professor dashboard
- Admin inbox
- Content health
- Disputes
- Weekly reports
- Monitoring
- Backups

**Done when:** 100 learners served without an unrecoverable incident, disputes resolvable from
stored evidence alone, and a restore from backup has actually been performed.

Maps to **v1.x** and part of **v2.0**.

---

## Phase 4 — Personalization

**Goal:** make selection genuinely personalized, and auditable.

**Lead:** Dev 1

**Deliverables**

- Difficulty calibration
- Misconception selection
- Spaced review
- Why-this-task
- Selector replay
- Better task targeting

**Done when:** selection quality beats the V1 rule set on transfer outcomes, and any historical
selection decision can be replayed and explained.

Maps to **v2.0**.

---

## Phase 5 — Production Debugging

**Goal:** teach production debugging in a realistic, observable environment.

**Lead:** Dev 2 (environment, observability) · Dev 1 (incident content, grading rubrics)

**Deliverables**

- Full Shopverse
- Redis
- Queue
- Worker
- Payment mock
- Observability
- Incident templates
- Incident packs
- Investigate mode
- Fix mode
- Postmortem grading
- Hosted sandbox
- Proctored AI-off

**Done when:** a learner can be dropped into a live incident, investigate it from real telemetry
(never fabricated logs), fix it, and have the postmortem graded.

Maps to **v3**.

---

## Phase 6 — Scale

**Goal:** more than one track, and a second audience.

**Lead:** Shared

**Deliverables**

- Python stack
- Second reference system
- Hiring assessments
- Verified profiles
- Additional tracks

**Done when:** a second track runs through the same four engines without special-casing, and a
verified profile is credible enough for a hiring decision.

Maps to **v3+**.

---

## Sequencing Rules

1. **Phases do not overlap by default.** Two developers cannot run two phases at once.
2. **No phase starts before the previous phase's "done when" is true.** Especially Phase 0 →
   Phase 1: do not start building because building feels more productive than interviewing.
3. **Phase 5 and 6 work must not influence V1 architecture** beyond not actively blocking it.
   No Redis, no Kubernetes, no Python preparation now.
4. **Anything not listed in a phase above is not on the roadmap.** See
   [`PRODUCT_SPEC.md` §16](./PRODUCT_SPEC.md) for what we will never build.

---

## Implementation Starting Sequence

### Step 1 — Development foundation

Owner: Developer 2.
Establish package management, workspaces, TypeScript, linting, testing, environment configuration, and basic CI.

### Step 2 — Shared contracts

Owner: Developer 2, with Developer 1 reviewing learner-facing types.
Define API and event contracts in `packages/contracts` before any dependent implementation begins.
