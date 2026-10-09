# ENGINEERING SIMULATOR — PRODUCT SPECIFICATION

> **This is the single source of truth for the product.**
>
> A developer should be able to read only this file and understand the complete current product,
> without reading every architecture document.
>
> **Jointly owned** by Developer 1 and Developer 2. Neither developer changes it alone.
>
> - "What are we building?" → **this file**
> - "How much is built?" → [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
> - "What is true right now?" → [`CURRENT_STATE.md`](./CURRENT_STATE.md)
> - "What ships in which version?" → [`RELEASE_PLAN.md`](./RELEASE_PLAN.md)

---

## 1. Product Summary

Engineering Simulator is a **structured engineering practice platform**.

Learners work on real engineering tasks against a real reference codebase, get deterministically
graded feedback, answer follow-up questions about their own reasoning, and build a profile of
**verified capability** over time.

It is a practice and verification system, not a course library. The product's output is not
"lessons completed" — it is **evidence that a learner can do engineering work**.

---

## 2. Problem

Indian CS students and early-career developers cannot bridge the gap between academic theory
(or basic tutorials) and real-world engineering practice.

They can pass multiple-choice tests, but they cannot:
- debug a system they did not write,
- work inside a large existing codebase,
- or build and verify a working change.

That is the problem this product addresses. No additional problems are claimed here.

---

## 3. Product Thesis

Learning engineering requires all five of the following, together:

| Element | Why it is required |
|---|---|
| **Diagnosis** | You cannot teach a learner until you know where their gaps actually are. Self-reported skill is unreliable. |
| **Real engineering tasks** | Toy problems do not transfer. The work must happen inside a realistic codebase with realistic constraints. |
| **Evidence** | Progress must be objectively demonstrated, not asserted. Evidence is produced by execution, not by self-report. |
| **Adaptive selection** | The right task at the right difficulty with the right support, chosen from learner history. |
| **Verification** | Correctness is decided by deterministic tests. Reasoning is probed by viva. Learning is proven by AI-off transfer. |

Remove any one of the five and the loop stops working: without diagnosis you guess; without
real tasks you do not transfer; without evidence you cannot adapt; without adaptation you waste
the learner's time; without verification you cannot claim anything.

---

## 4. Target Users

**Primary (the MVP audience):**
- Indian CS students, **2nd–4th year**
- Early-career developers
- **Laptop users** (local execution is assumed — see §16: not mobile-first)

**Initial focus:**
Students preparing for engineering roles and internships.

This is the exact target from the product specification. The product is not currently designed
for any other primary audience.

---

## 5. Secondary Users

**Future — business expansion. Not part of the MVP.**

- Colleges
- Faculty
- Placement teams
- Companies / hiring teams

These users appear from **Phase 3** (college pilot) and **Phase 6** (hiring) onward.
No secondary-user feature is in V1. See [`RELEASE_PLAN.md`](./RELEASE_PLAN.md).

---

## 6. First Track

**Backend Engineering.**

Stack:
- Node.js
- TypeScript
- PostgreSQL

**Redis comes into the system later** (Phase 5 — production debugging).
**Python comes later** (Phase 6 — scale).

Do not prepare Redis or Python infrastructure now.

---

## 7. User Persona

**Rahul** — the reference persona from the product specification.

| Field | Value |
|---|---|
| Year | 3rd year CS student |
| Goal | Secure a backend internship |
| Target role | Backend engineer |
| Weekly time | 4–6 hours |
| Diagnostic | Baseline skill assessment at signup |
| Skill weaknesses found | Database query design; error handling |
| First task | A basic N+1 query issue in a realistic codebase |
| Submission | Submits his patch using the CLI |
| Evaluation | Hidden tests verify correctness deterministically |
| Viva | Answers 4 follow-up questions explaining *why* the N+1 occurred |
| Next task | A related index design problem, chosen by the selector |
| Incident example | A production-style incident on the same skill area — **Phase 5 capability, not V1** (see §15) |
| Transfer | A weekly **AI-off** task proves he can solve a new problem without mentor help |
| Weekly report | Shows his progress and mastery increases |

No persona details beyond the source specification are invented here. The incident example is
marked explicitly as a later-phase capability because production incidents are Phase 5.

---

## 8. Core User Flow

```
Signup
  → Goal
    → Diagnostic
      → Skill Profile
        → Task
          → Mentor / Hints
            → Submit
              → Evaluation
                → Viva
                  → Transfer
                    → Profile Update
                      → Next Task
                        → Weekly Report
```

Every step in this flow is in V1. If a step is missing, V1 is not complete.

---

## 9. Core Learning Loop

```
Diagnose → Learn → Build → Break → Debug → Verify → Reassess → Adapt
```

- **Diagnose** — find the real gap.
- **Learn** — minimum necessary input, delivered in context.
- **Build** — make a change in a real codebase.
- **Break** — encounter the authored fault / failure mode.
- **Debug** — locate and reason about the cause.
- **Verify** — hidden tests decide whether it is actually fixed.
- **Reassess** — update the learner's evidence and mastery.
- **Adapt** — the selector picks the next task from the updated profile.

The loop is the product. Features exist to serve the loop.

---

## 10. Four Engines

### Content Engine — `packages/content/` (Dev 1)
Human-authored knowledge: skill definitions, the skill graph, task templates, fault patterns,
validated variants, hint ladders, rubrics, misconceptions, and viva questions.
Humans author knowledge; machines create variety. Every learner-facing problem is pre-built
and pre-validated before a learner ever sees it.

### Learner Model — `packages/learner-model/` (Dev 1)
The learner's state: per-skill mastery (Beta model), the evidence events that produced it,
observed misconceptions, and learner flags. It consumes evaluation results and viva outcomes
and produces an updated capability picture. It never guesses from self-report.

### Selector — `packages/selector/` (Dev 1)
Rule-based adaptive selection of the next task: which skill, which variant, which difficulty,
how much support. It reads the Learner Model and the content library and returns a decision
that can be explained. Rule-based first, by design — see `docs/decisions/ADR-005`.

### Evaluator — `packages/evaluator/` + `apps/worker/` (Dev 2)
Deterministic execution: applies the submission, runs hidden tests and benchmarks inside Docker
with resource limits, and emits a structured result. **Tests decide whether code is correct.**
AI is used only to grade free-text reasoning against fixed rubrics.

---

## 11. What Makes the Product Different

AI is **not** the moat. These mechanisms are:

| Mechanism | Why it is defensible |
|---|---|
| **Capability / evidence model** | A per-skill record built from executed work, not time spent or videos watched. It compounds and cannot be copied without the same task library and grading. |
| **Realistic engineering tasks** | Work happens inside an existing reference codebase. Building that codebase, its faults, and its tests is slow, deliberate work. |
| **Validated variants** | Every variant is proven to apply cleanly, fail without the fix, and pass with the fix. This validation is the expensive part. |
| **Deterministic evaluation** | Correctness comes from tests, so results are reproducible and disputable on evidence. |
| **Misconception tracking** | We identify the specific faulty mental model, not just "wrong answer". |
| **Adaptive selection** | Explainable, rule-based task targeting from real evidence. |
| **AI-assisted but AI-independent verification** | AI probes reasoning; tests judge code. Removing the AI does not break grading. |
| **AI-off transfer** | The only honest measurement of learning: can they do it unaided? |

---

## 12. V1 — Strict Definition

**V1 is the smallest usable product.** If an item is not in this list, it is not in V1.

**V1 is exactly:**
- Backend / Node.js track — one track only
- One reference system (Shopverse)
- 12 skills
- 15 task templates
- ~60 validated variants
- Diagnostic
- Skill profile
- Task workspace
- Local execution
- CLI
- Hidden-test grading
- Mentor
- Hints
- 4-question viva
- AI-off transfer
- Evidence update
- Rule-based selection
- Weekly report

**Explicitly NOT V1:**

| Not in V1 | Where it belongs |
|---|---|
| Live problem generation | Never — see §16 |
| Hosted learner sandboxes | Phase 5 / V3 |
| Production incidents, investigate/fix modes, postmortem grading | Phase 5 / V3 |
| Redis, queues, multiple workers | Phase 2 (queue) / Phase 5 (full) |
| ML-based selection or calibration | Phase 4 / V2 |
| Spaced review, why-this-task, selector replay | Phase 4 / V2 |
| Professor dashboard, admin inbox, disputes, content health | Phase 3 / V2 |
| Second reference system, Python track | Phase 6 / V3 |
| Hiring assessments, verified profiles | Phase 6 / V3 |
| Mobile app | Never as primary — see §16 |
| Kubernetes, multi-region | Phase 5+ / never early |

---

## 13. V1 Success Criteria

**V1 is successful only if learners can complete the complete loop and demonstrate improvement
on AI-off transfer tasks.**

The critical measurement chain is:

```
Practice → Evaluation → Transfer
```

- **Practice** — the learner attempts authored tasks with mentor and hints available.
- **Evaluation** — hidden tests produce a deterministic, reproducible result.
- **Transfer** — a separate, AI-off task on the same skill, graded the same way.

V1 is validated when transfer performance improves after practice. Practice pass rate alone is
**not** success: a learner passing practice tasks with heavy mentor support and failing transfer
means the product is not working.

Secondary signals (not substitutes for the above): calibrated difficulty solved over time, and
loop completion rate.

---

## 14. V2 — First Expansion After V1 Is Proven

V2 exists only once V1's transfer measurement holds. It is the Phase 3 + Phase 4 band.

**V2 adds:**
- First college pilot
- Professor dashboard
- Content health
- Disputes
- Weekly reports (institution-facing, beyond the learner's own report)
- Stronger selector
- Variant calibration
- Misconception-driven selection
- Spaced review
- Why-this-task
- Selector replay

**V2 does not add:** production incidents, hosted sandboxes, proctoring, Python, a second
reference system, or hiring products. Those are V3.

The V1/V2 boundary: **V1 proves one learner can improve. V2 makes that work for an institution
and makes the selection genuinely personalized.**

---

## 15. V3 / Future

- Production debugging environment
- Incidents (incident templates, incident packs, investigate mode, fix mode, postmortem grading)
- Hosted sandbox
- Proctored AI-off
- Python
- Second reference system
- Hiring assessments
- Verified profiles
- Additional tracks

These correspond to Phase 5 and Phase 6. Nothing here should influence V1 architecture beyond
not actively blocking it.

---

## 16. What We Will Not Build

| We will not build | Reason |
|---|---|
| **Live problem generation** | Every learner-facing problem must be pre-built and pre-validated. Never generate a problem while a learner waits. |
| **A generic AI tutor** | Chat is not the product. Verified capability is. |
| **A mobile-first platform** | The work is engineering work on a laptop. |
| **Kubernetes early** | Two developers, no scale problem. It would be cost without benefit. |
| **Multi-region systems** | No requirement exists. |
| **Unnecessary ML** | Rule-based selection is explainable and sufficient until it demonstrably is not. |
| **Fake logs** | All diagnostic signals must come from actually running code. |
| **Uncontrolled AI grading** | AI must never decide whether code is objectively correct. |
| **A giant course library** | Depth over breadth. One track, done properly. |

If you are tempted to build any of these, open an architecture issue first.

---

## 17. AI Philosophy

**AI should:**
- help
- guide
- question
- explain
- generate variants offline (for human validation)
- assist evaluation of reasoning (against fixed rubrics)

**AI must NOT:**
- decide objective code correctness
- generate unvalidated learner problems
- invent system logs
- replace deterministic tests

The system must remain correct with the AI switched off. AI-off transfer tasks are the proof
that this holds. See [`AI_POLICY.md`](./AI_POLICY.md).

---

## 18. Data We Store

| Data | Purpose |
|---|---|
| Learner profile (identity, goal, target role, weekly time) | Onboarding and selection |
| Per-skill state (mastery, confidence, last practised) | Learner Model, selection |
| Evidence events (what was executed, what the result was) | The capability record |
| Attempt records (task, variant, mode, support level, timings) | Loop integrity, selection |
| Submission patches | Grading, and dispute resolution — retained only as long as needed |
| Evaluation results (test outcomes, benchmarks, structured failures) | Grading and evidence |
| Viva transcripts and rubric scores | Reasoning assessment |
| Observed misconceptions | Targeted selection |
| AI usage records (prompt/response metadata, tokens, cost) | Cost control, grounding audits |
| Learner flags (e.g. suspected copy, repeated hint exhaustion) | Content and integrity health |

See [`DATABASE.md`](./DATABASE.md) for the authoritative schema and
[`PRIVACY.md`](./PRIVACY.md) for retention.

---

## 19. Data We Do Not Store

- Raw keystrokes
- Full terminal history
- Screen recordings
- Learner secrets or credentials
- Unrelated files from the learner's machine
- Browsing history

The CLI runs on the learner's own laptop. It sends the submission and the evaluation-relevant
output — nothing else. This is a hard constraint, not a preference. See
[`PRIVACY.md`](./PRIVACY.md).

---

## 20. Business Model

Only what the product specification supports:

- **Initial direction:** college pilots.
- **Later:** companies / hiring.

No pricing is defined. Do not invent pricing, tiers, or revenue projections in this repository.

---

## 21. Roadmap

| Phase | Name | Band |
|---|---|---|
| Phase 0 | Validation | pre-V0.1 |
| Phase 1 | Prototype | V0.1 – V0.2 |
| Phase 2 | First usable product | V1.0 |
| Phase 3 | First 100 users | V1.x – V2.0 |
| Phase 4 | Personalization | V2.0 |
| Phase 5 | Production debugging | V3 |
| Phase 6 | Scale | V3+ |

Full detail: [`ROADMAP.md`](./ROADMAP.md). Version mapping: [`RELEASE_PLAN.md`](./RELEASE_PLAN.md).

---

## 22. Current Product Status

**Progress data is not duplicated here.**

- How much is built → [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
- What is true right now → [`CURRENT_STATE.md`](./CURRENT_STATE.md)
- Who owns what → [`docs/TEAM.md`](./docs/TEAM.md)
