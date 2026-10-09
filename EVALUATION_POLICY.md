# Evaluation Policy

**Owner:** Developer 5 (Evaluator)
**Status:** Active — all evaluation logic must comply with this policy.

---

## Core Principle

> Deterministic evaluation comes before AI.

Tests, benchmarks, and structured answers decide objective correctness. AI evaluates reasoning and explanation only — against fixed rubrics.

---

## Evaluation Layers (in order of execution)

| Layer                 | What it judges                        | Method                             |
| --------------------- | ------------------------------------- | ---------------------------------- |
| 1. Patch validation   | Does the code apply cleanly?          | Deterministic                      |
| 2. Public tests       | Basic correctness                     | Deterministic (test runner)        |
| 3. Hidden tests       | Full correctness                      | Deterministic (test runner)        |
| 4. Benchmarks         | Performance/load correctness          | Deterministic (runner + threshold) |
| 5. Structured answers | Factual/multiple-choice reasoning     | Exact match / authored answer key  |
| 6. AI rubric grading  | Design reasoning, explanation quality | LLM against fixed rubric           |

**Layers 1–5 run before Layer 6.**
**Layer 6 runs only if the task includes a reasoning/explanation component.**

---

## What AI May Evaluate

- Free-text design reasoning (e.g., "Why did you choose this index?")
- Explanation quality in viva answers
- Postmortem narrative quality [FUTURE]

In all cases, AI grading uses a **fixed, human-authored rubric** and returns a **structured result**.

---

## What AI Must NOT Evaluate

- Whether code passes or fails a test
- Whether a benchmark threshold is met
- Whether a SQL query is correct
- Anything decidable by running the code

---

## Evaluation Result Structure

Every evaluation produces:

```typescript
{
  id: string;
  submissionId: string;
  attemptId: string;

  // Deterministic results
  patchValid: boolean;
  publicTestsPassed: number;
  publicTestsTotal: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  benchmarksPassed: boolean | null;

  // Structured answer results
  structuredAnswers: Array<{
    questionId: string;
    correct: boolean;
    givenAnswer: string;
  }>;

  // AI rubric results (null if not applicable)
  rubricResults: Array<{
    rubricItemId: string;
    pass: boolean;
    evidenceQuote: string;
  }> | null;

  // Overall
  passed: boolean; // true only if all required layers pass
  score: number; // 0.0–1.0
  evidenceType: string; // 'practice' | 'transfer'
  createdAt: string;
}
```

---

## Grading Job Lifecycle

```
Submission created
  → Grading job enqueued (pg-boss)
  → Worker picks job
  → Validate patch
  → Prepare isolated Docker environment
  → Apply patch to reference system
  → Run public tests
  → Run hidden tests
  → Run benchmarks (if applicable)
  → Evaluate structured answers (if applicable)
  → Create deterministic evaluation record
  → (If reasoning grading required) → Call AI rubric grader
  → Combine results → final evaluation
  → Emit evidence events
  → Update attempt status
  → Notify API (poll or SSE)
```

---

## Isolation Requirements

- Every grading job runs in an **isolated Docker container**.
- Containers must not share filesystem state.
- Containers have CPU and memory limits.
- Containers have a maximum execution timeout (configurable per task type).
- Network access is restricted during grading.

### Resource Limits (MVP defaults)

| Limit             | Default                  |
| ----------------- | ------------------------ |
| CPU               | 0.5 cores                |
| Memory            | 512 MB                   |
| Execution timeout | 60 seconds               |
| Network           | Disabled (internal only) |

---

## Retry and Failure Behavior

| Event                    | Behavior                                                      |
| ------------------------ | ------------------------------------------------------------- |
| Docker startup failure   | Retry up to 3 times with backoff                              |
| Test runner crash        | Mark as `grading_error`, notify learner                       |
| Timeout exceeded         | Mark as `timeout`, notify learner                             |
| All retries exhausted    | Mark as `failed`, flag for ops review                         |
| AI rubric grader failure | Mark reasoning as `ungraded`, do not block pass/fail decision |

---

## Idempotency

- Grading jobs are idempotent: re-running the same submission produces the same result.
- Submissions have a unique constraint on (attempt_id, submission_hash).
- Worker checks for existing evaluation before processing.

---

## Evidence Generation

After a successful evaluation, the evaluator emits `EvidenceEvent` records:

```typescript
{
  attemptId: string;
  learnerId: string;
  skillId: string;
  evidenceType: 'practice' | 'transfer';
  passed: boolean;
  score: number;
  difficulty: number; // variant difficulty at time of attempt
  taskMode: string;
  timestamp: string;
}
```

Evidence events are consumed by the Learner Model to update skill mastery.

---

## Prohibited Evaluation Behaviors

1. Do NOT use AI to decide pass/fail on code correctness.
2. Do NOT reuse containers between submissions.
3. Do NOT allow learner-submitted code to access the network during grading.
4. Do NOT modify the hidden test suite at runtime.
5. Do NOT skip deterministic layers even if AI grading is available.
6. Do NOT return partial results without clearly marking them as partial.
