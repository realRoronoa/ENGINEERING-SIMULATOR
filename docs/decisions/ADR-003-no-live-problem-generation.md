# ADR-003: No Live Problem Generation

**Status:** Accepted
**Date:** 2024-01
**Authors:** Architecture Team

---

## Context

The platform needs to provide learners with engineering tasks. Options:

1. **Live generation** — use an LLM to generate a new task for each learner in real time
2. **Pre-built library** — author, validate, and publish tasks offline; select from the library at runtime
3. **Hybrid** — pre-built templates, live parameter injection

---

## Decision

We will use a **pre-built, pre-validated content library** with no live problem generation.

The Selector chooses from the validated variant pool. It does not generate content.

AI may assist in **drafting** variants **offline** — but all variants must pass human review and automated validation before being published.

---

## Rationale

1. **Quality:** Live-generated problems have unpredictable quality. A learner stuck on a broken, AI-generated task is a poor experience.

2. **Validation:** We need hidden tests to grade submissions. Writing correct hidden tests for a live-generated problem is not feasible in real time.

3. **Fact sheets:** The AI mentor must be grounded in a verified fact sheet. Fact sheets must be human-verified. This cannot happen live.

4. **Latency:** Generating a high-quality task with correct instructions, fact sheets, hints, and viva questions takes time. Learners should not wait.

5. **Reproducibility:** A pre-built variant can be version-controlled, audited, and improved. A live-generated problem disappears after the session.

6. **Fairness:** If two learners get different problems, comparing their progress is harder. A calibrated variant library enables fair comparison.

7. **Economics at scale:** At 1,000+ learners, live generation is expensive. A variant library amortizes authoring cost across many learners.

---

## Consequences

- Content authoring becomes a first-class engineering function (Developer 4 is a dedicated content engineer).
- The content library must be large enough that learners don't see repeats. ~60 variants for MVP.
- A systematic variant generation + critique + validation pipeline is needed (offline, Phase 2).
- The Selector must handle graceful fallback when no suitable variant exists.

---

## What This Decision Does NOT Mean

- This does not mean AI cannot help. AI assists in drafting and critiquing variants **offline**.
- This does not mean every learner gets exactly the same task. The Selector personalizes by choosing from the library.
- Personalization comes from **selection + difficulty + support + memory**, not unique problem generation.
