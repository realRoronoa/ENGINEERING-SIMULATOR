# RELEASE PLAN

> Version-by-version scope. Every version states its **goal**, **features**, **excluded
> features**, **success criteria**, and **release blockers**.
>
> - Product definition → [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)
> - Live progress → [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
> - Shipped history → [`CHANGELOG.md`](./CHANGELOG.md)
> - Phase detail → [`ROADMAP.md`](./ROADMAP.md)

**Rule:** a version ships when its success criteria are met and its release blockers are
cleared — not when the calendar says so. Scope is cut, not quality.

| Version | Band                   | Phase     | Audience                        |
| ------- | ---------------------- | --------- | ------------------------------- |
| v0.1    | Internal prototype     | Phase 1   | The two developers only         |
| v0.2    | Learner prototype      | Phase 1   | ~5 hand-held learners           |
| v1.0    | First usable product   | Phase 2   | Self-serve learners             |
| v1.x    | Improvements           | Phase 3   | First 100 users / first college |
| v2.0    | First scalable product | Phase 3–4 | Institutions + personalization  |

---

## V0.1 — Internal Prototype

**Goal**
Prove the technical pipeline end to end: a submission can be graded deterministically by
machine, with no human in the loop.

**Features**

- Shopverse reference system runs in Docker locally
- One hardcoded task with one injected fault
- Hidden tests for that fault
- CLI submission path (setup → test → submit)
- Grading worker that applies the patch and runs hidden tests under resource limits
- Structured evaluation result printed back to the CLI

**Excluded features**
Web UI, learner accounts, database persistence beyond the minimum, selector, learner model,
AI mentor, viva, transfer, diagnostic, content library, deployment.

**Success criteria**

- The same submission graded twice produces the same result (determinism).
- The hidden test **fails without** the fix and **passes with** the fix.
- A grading run completes within its resource and time limits, and a hanging submission is
  killed rather than hanging the worker.

**Release blockers**

- None external — this version is internal. It is not shown to a learner.

**Owner split**
Dev 2 leads (reference system, worker, evaluator). Dev 1 provides the task brief and expected
behaviour for the single fault.

---

## V0.2 — Learner Prototype

**Goal**
Put the loop in front of real learners for the first time, with the developers watching.
Learn whether the loop is worth building properly.

**Features**

- 3 debug tasks (authored, validated)
- Basic web interface: task view, submission state, results page
- AI mentor (grounded, with usage limits)
- 4-question viva
- One AI-off transfer task
- Minimal persistence of attempts and results

**Excluded features**
Diagnostic, skill profile, rule-based selector, Beta mastery model, full content library,
weekly report, hint ladder depth, queues, staging/production deployment.

**Success criteria**

- 5 learners each complete at least one full practice → evaluation → viva → transfer cycle.
- The developers can state, from observed evidence, whether transfer outcomes differed from
  practice outcomes.
- No learner is blocked by platform failure during their session.

**Release blockers**

- Mentor grounding verified: the mentor must not hand over the answer.
- Hidden tests not exposed to the learner in any response, log, or error message.
- Manual rollback path documented, since this is run with real people.

**Owner split**
Dev 1: tasks, web interface, viva questions, transfer task.
Dev 2: API, persistence, grading, mentor/viva AI plumbing.

---

## V1.0 — First Usable Product (MVP)

**Goal**
The smallest product a learner can use on their own, repeatedly, without a developer present —
and which produces a credible capability record.

**Features** (exactly the V1 list in [`PRODUCT_SPEC.md` §12](./PRODUCT_SPEC.md))

- Backend / Node.js track, one reference system (Shopverse)
- 12 skills, 15 task templates, ~60 validated variants
- Diagnostic and skill profile
- Task workspace, local execution, CLI
- Hidden-test grading
- Mentor and hint ladder
- 4-question viva
- AI-off transfer task
- Evidence update and rule-based selection
- Weekly report

**Excluded features**
Professor dashboard, admin inbox, disputes, content health, spaced review, why-this-task,
selector replay, variant calibration, misconception-driven selection, ML of any kind,
incidents, hosted sandbox, proctoring, Redis beyond a simple queue, Python, second reference
system, hiring products, mobile app, Kubernetes, multi-region.

**Success criteria**

- A learner completes the full flow unaided: signup → goal → diagnostic → skill profile → task
  → mentor/hints → submit → evaluation → viva → transfer → profile update → next task →
  weekly report.
- **Transfer improvement is observed:** AI-off transfer performance improves after practice on
  the same skill. This is the single criterion that decides whether V1 worked.
- The selector's choice can be explained from the learner's evidence for every assignment.
- Grading is reproducible: re-running an evaluation produces the same verdict.

**Release blockers**

- [ ] Security review complete (authorization boundaries: no learner reads another's data)
- [ ] Privacy review complete (nothing from [`PRODUCT_SPEC.md` §19](./PRODUCT_SPEC.md) is stored)
- [ ] E2E flow test passes against a real database and real Docker grading
- [ ] All 60 variants pass content validation (applies cleanly / fails without fix / passes with fix)
- [ ] Database migrations tested forward on a copy of real data
- [ ] Hidden tests confirmed unreachable from any learner-facing surface
- [ ] `PROJECT_STATUS.md` release checklist fully ticked
- [ ] Documentation current: `PRODUCT_SPEC.md`, `API_CONTRACT.md`, `DATABASE.md`, `CURRENT_STATE.md`

**Owner split**
Dev 1: web app, CLI, content (12/15/60), learner model, selector, weekly report.
Dev 2: API, database, grading worker, evaluator, AI mentor/viva services, infrastructure,
deployment.
Shared: contracts, security review, privacy review, E2E strategy, release decision.

---

## V1.x — Improvements

**Goal**
Make V1 survive contact with its first 100 users and its first institution, without expanding
the product thesis.

**Features**

- Reliability and performance fixes driven by real usage
- Content health signals (which variants are too easy, too hard, or broken)
- Dispute handling for contested evaluations
- Weekly reports hardened
- Monitoring and backups
- First college pilot support
- Professor dashboard (first version)
- Admin inbox

**Excluded features**
Python track, incidents and investigate/fix modes, hosted sandboxes, proctoring, second
reference system, hiring assessments, ML selection.

**Success criteria**

- 100 learners served without an unrecoverable incident.
- Content health data is good enough to retire or fix bad variants.
- Disputes are resolvable from stored evidence alone.

**Release blockers**

- [ ] Backups verified by an actual restore
- [ ] Monitoring alerts on grading queue depth and failure rate
- [ ] Data retention job in place for submission patches

---

## V2.0 — First Scalable Product

**Goal**
Personalization becomes real, and the product works for an institution rather than one learner
at a time.

**Features**

- Stronger selector
- Variant difficulty calibration from observed outcomes
- Misconception-driven selection
- Spaced review
- Why-this-task explanation surfaced to the learner
- Selector replay (reconstruct and audit a past selection decision)
- Institution-facing reporting

**Excluded features**
Multi-region, hiring assessments, verified profiles, Python track, second reference system,
hosted sandbox, proctored AI-off. Those are V3 / Phase 5–6.

**Success criteria**

- Selection quality is measurably better than the V1 rule set on transfer outcomes.
- Every selection decision is replayable and explainable after the fact.
- Calibrated difficulty solved per learner trends upward over time.

**Release blockers**

- [ ] Selector replay can reproduce any historical decision from stored state
- [ ] Calibration cannot silently remove a skill from a learner's path
- [ ] Spaced review does not starve new-skill progress

---

## Versioning Rules

- **Patch (`v1.0.x`)** — fixes and content corrections; no contract change.
- **Minor (`v1.x.0`)** — additive features; backward-compatible contracts and migrations.
- **Major (`vX.0.0`)** — contract or data-model breaks, or a scope band change (V1 → V2).

Content-only changes (new validated variants) ship as patch releases and are recorded in
[`CHANGELOG.md`](./CHANGELOG.md) under **Added**.
