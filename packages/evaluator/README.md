# packages/evaluator — Grading Engine

**Owner:** Developer 5 (Evaluation / Grading)
**Tech:** Node.js, TypeScript, Docker SDK

---

## Purpose

The core grading logic. This package contains the deterministic evaluation engine — it is used by `apps/worker`.

It does NOT contain the queue management or container lifecycle (that lives in `apps/worker`). This package contains the pure grading logic that the worker invokes.

---

## Responsibilities

- Patch validation (does the diff apply cleanly?)
- Test execution result parsing
- Hidden test execution orchestration
- Benchmark evaluation
- Structured answer evaluation against authored answer keys
- Evaluation result construction
- Evidence event construction
- AI rubric grading delegation (calls `packages/ai`)

---

## Structure

```
packages/evaluator/src/
├── index.ts                   # Public exports
├── patch/
│   └── validator.ts           # Validate and apply patch
├── tests/
│   ├── runner.ts              # Parse and interpret test results
│   └── hidden.ts              # Hidden test orchestration
├── benchmarks/
│   └── evaluator.ts           # Benchmark threshold checking [Phase 2]
├── structured/
│   └── evaluator.ts           # Evaluate structured answers
├── evaluation/
│   └── builder.ts             # Build final EvaluationPayload
├── evidence/
│   └── builder.ts             # Build EvidenceEventPayload from evaluation
└── types.ts                   # Internal evaluator types
```

---

## Grading Contract

**Input:**

```typescript
interface GradingInput {
  patch: string;
  structuredAnswers: Array<{ questionId: string; answer: string }>;
  variantId: string;
  hiddenTestsPath: string;
  dockerContainerId: string; // pre-started by worker
  answerKey: AnswerKey; // from content package
  rubricId: string | null;
}
```

**Output:**

```typescript
// EvaluationPayload — from packages/contracts
```

---

## Evaluation Layers (in order)

1. **Patch validation** — does the diff apply cleanly?
2. **Public tests** — run and parse results
3. **Hidden tests** — run and parse results
4. **Benchmarks** — check thresholds [Phase 2]
5. **Structured answers** — exact match against answer key
6. **AI rubric grading** — delegate to `packages/ai` [Phase 2]

**Pass/Fail Rule:**

```
passed = patch_valid
       AND hidden_tests_passed == hidden_tests_total
       AND (benchmarks_passed OR benchmarks_passed == null)
       AND (structured_answers_all_correct OR no_structured_answers)
```

AI rubric results are stored but do not block `passed` for MVP.

---

## Dependencies

| Package              | Usage                               |
| -------------------- | ----------------------------------- |
| `packages/contracts` | Input/output types                  |
| `packages/ai`        | AI rubric grading (Phase 2)         |
| `packages/database`  | Read answer keys, write evaluations |

---

## What This Package Must NOT Do

- Manage Docker containers (belongs to `apps/worker`)
- Manage the grading queue (belongs to `apps/worker`)
- Use AI to decide code correctness (prohibited by `EVALUATION_POLICY.md`)
- Modify the hidden test suite at runtime
- Access learner PII beyond the attempt ID

---

## Testing Requirements

- Unit tests for all grading logic (patch validation, answer evaluation, result construction).
- Use mock Docker output (do not require Docker in unit tests).
- Integration tests (with Docker) live in `apps/worker`.
- Every evaluation layer must have its own test suite.
- Test the `passed = false` path for each failure mode.
