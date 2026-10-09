# Event Contract

**Owner:** All developers — changes require 2 reviewer approvals.

> **Rule:** Change the contract first, then update implementations.

---

## Overview

Internal async events are used for:

1. Grading job dispatch (API → Worker via queue)
2. Evaluation result notification (Worker → API)
3. Evidence event emission (Evaluator → Learner Model)

All events are defined as TypeScript types in `packages/contracts/events/`.

---

## Event: `GradingJobCreated`

**Producer:** API (on submission)
**Consumer:** Grading Worker

```typescript
{
  eventType: 'grading.job.created';
  jobId: string;
  submissionId: string;
  attemptId: string;
  learnerId: string;
  variantId: string;
  referenceSystemDockerImage: string;
  patch: string;               // unified diff
  structuredAnswers: Array<{
    questionId: string;
    answer: string;
  }>;
  hiddenTestsPath: string;     // path in reference system to hidden tests
  resourceLimits: {
    cpuCores: number;
    memoryMb: number;
    timeoutSeconds: number;
  };
  idempotencyKey: string;
  createdAt: string;
}
```

---

## Event: `GradingJobCompleted`

**Producer:** Grading Worker
**Consumer:** API

```typescript
{
  eventType: 'grading.job.completed';
  jobId: string;
  submissionId: string;
  attemptId: string;
  result: {
    patchValid: boolean;
    publicTestsPassed: number;
    publicTestsTotal: number;
    hiddenTestsPassed: number;
    hiddenTestsTotal: number;
    benchmarksPassed: boolean | null;
    structuredAnswersResult: Array<{
      questionId: string;
      correct: boolean;
      givenAnswer: string;
    }>;
    passed: boolean;
    score: number;
  };
  gradingError: string | null;
  completedAt: string;
}
```

---

## Event: `GradingJobFailed`

**Producer:** Grading Worker
**Consumer:** API

```typescript
{
  eventType: 'grading.job.failed';
  jobId: string;
  submissionId: string;
  attemptId: string;
  errorType: 'docker_error' | 'timeout' | 'patch_invalid' | 'unknown';
  errorMessage: string;
  retryCount: number;
  failedAt: string;
}
```

---

## Event: `EvidenceEmitted`

**Producer:** Evaluator (after successful evaluation)
**Consumer:** Learner Model

```typescript
{
  eventType: 'evidence.emitted';
  evidenceId: string;
  learnerId: string;
  attemptId: string;
  skillId: string;
  evidenceType: 'practice' | 'transfer' | 'diagnostic';
  passed: boolean;
  score: number;
  difficulty: number;
  taskMode: string;
  occurredAt: string;
}
```

---

## Queue Implementation (MVP)

- Queue: **pg-boss** (PostgreSQL-backed)
- All jobs are persistent and recoverable
- Job IDs are idempotent — duplicate job creation is safe
- Dead letter queue for failed jobs after max retries

---

## Retry Policy

| Failure Type | Max Retries | Backoff |
|---|---|---|
| Docker startup failure | 3 | Exponential (1s, 5s, 30s) |
| Test runner crash | 2 | Fixed (10s) |
| Timeout | 0 | No retry — log and fail |
| Unknown error | 2 | Exponential |

---

## Future Events [FUTURE — Phase 5]

| Event | Notes |
|---|---|
| `incident.created` | Production incident task assigned |
| `sandbox.ready` | Hosted sandbox environment ready |
| `postmortem.submitted` | Postmortem submission for grading |
