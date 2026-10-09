# ADR-002: Deterministic Evaluation First

**Status:** Accepted
**Date:** 2024-01
**Authors:** Architecture Team

---

## Context

The platform needs to grade learner code submissions. Options for grading:

1. **AI-only grading** — send code to an LLM, ask if it's correct
2. **Deterministic-only grading** — run tests, check pass/fail
3. **Hybrid** — deterministic tests first, AI for reasoning/explanation only

---

## Decision

We will use **deterministic evaluation first, AI for reasoning only**.

Specifically:

- Code correctness is determined by running tests in an isolated Docker container.
- AI rubric grading is used ONLY for free-text reasoning, design explanations, and viva answers — against a fixed, human-authored rubric.
- AI does NOT decide pass/fail for code submissions.

---

## Rationale

1. **Reliability:** Tests produce deterministic results. The same code always produces the same result. LLMs are probabilistic and can disagree with themselves.

2. **Trust:** Learners need to trust the grader. "The tests say your code is wrong" is auditable. "The AI thinks your code is wrong" is not.

3. **Disputes:** Deterministic results are disputable with concrete evidence. AI results are harder to dispute.

4. **Cost:** Running tests is cheap. LLM calls are expensive. Grading thousands of submissions with LLMs would be cost-prohibitive.

5. **Integrity:** AI graders can be prompted to change their verdict. Test results cannot.

6. **The right tool for the job:** AI is excellent at evaluating nuanced reasoning and explanations. Tests are excellent at evaluating code correctness. Use each for what it's best at.

---

## Consequences

- Hidden tests must be authored carefully. A bad test suite is a bad grader.
- The test authoring workflow (Developer 4 + 5 collaboration) is critical.
- AI rubric grading is an additive signal, not the primary signal.
- Evaluation results are always auditable (stored in `evaluations` table).
- If hidden tests are wrong, we can update them and re-grade (since submissions are stored).

---

## What This Decision Does NOT Mean

- This does not mean AI has no role in evaluation. AI evaluates reasoning in viva and explanation grading.
- This does not mean the hidden tests are perfect. They will have bugs; the dispute mechanism handles this.
