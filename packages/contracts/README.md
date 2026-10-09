# packages/contracts — Shared Type Contracts

**Owner:** ALL developers
**Required reviewers for changes:** 2 developers from affected areas

> **Rule:** Change the contract first, then update implementations.
>
> No developer should depend on another package's internal implementation — only the exported contract types.

---

## Purpose

`packages/contracts` is the **shared language of the entire system**.

Every TypeScript type that crosses a module boundary lives here.
If Developer 2 (API) and Developer 7 (Selector) need to share a type — it lives here.
If Developer 5 (Evaluator) emits an event that Developer 6 (Learner Model) consumes — the event type lives here.

---

## Structure

```
packages/contracts/
├── README.md                  (this file)
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               # Re-exports all public types
    ├── api/
    │   ├── index.ts
    │   ├── onboarding.ts
    │   ├── diagnostic.ts
    │   ├── sessions.ts
    │   ├── attempts.ts
    │   ├── submissions.ts
    │   ├── viva.ts
    │   ├── profile.ts
    │   ├── progress.ts
    │   └── errors.ts          # Standard error codes
    ├── events/
    │   ├── index.ts
    │   ├── grading.ts         # GradingJobCreated, GradingJobCompleted, GradingJobFailed
    │   └── evidence.ts        # EvidenceEmitted
    ├── evaluator/
    │   ├── index.ts
    │   ├── evaluation.ts      # EvaluationPayload, EvaluationResult
    │   └── grading-job.ts     # GradingJobPayload
    ├── selector/
    │   ├── index.ts
    │   └── decision.ts        # SelectorDecision, SelectorInput
    ├── learner-model/
    │   ├── index.ts
    │   ├── skill-state.ts     # SkillStatePayload
    │   └── evidence.ts        # EvidenceEventPayload
    ├── ai/
    │   ├── index.ts
    │   ├── mentor.ts          # MentorRequestPayload, MentorResponsePayload
    │   ├── viva.ts            # VivaPayload
    │   └── rubric.ts          # RubricGradingPayload, RubricResult
    └── shared/
        ├── index.ts
        ├── task.ts            # TaskPayload, VariantPayload
        ├── attempt.ts         # AttemptPayload
        ├── submission.ts      # SubmissionPayload
        └── hint.ts            # HintPayload
```

---

## Core Types (Placeholders — to be implemented)

### AttemptPayload

```typescript
// TODO: implement in packages/contracts/src/shared/attempt.ts
export interface AttemptPayload {
  id: string;
  sessionId: string;
  learnerId: string;
  variantId: string;
  status: AttemptStatus;
  selectorDecision: SelectorDecision;
  hintsUsed: number;
  submissionsCount: number;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export type AttemptStatus =
  | 'created'
  | 'started'
  | 'working'
  | 'submitted'
  | 'grading'
  | 'evaluated'
  | 'viva'
  | 'transfer'
  | 'completed'
  | 'abandoned';
```

### TaskPayload

```typescript
// TODO: implement in packages/contracts/src/shared/task.ts
export interface TaskPayload {
  id: string; // variant ID
  title: string;
  narrative: string;
  instructions: string;
  mode: TaskMode;
  difficulty: number;
  skillIds: string[];
  estimatedMinutes: number;
  factSheet: string;
  referenceSystem: {
    name: string;
    dockerImage: string;
  };
}

export type TaskMode = 'debug' | 'build' | 'fix' | 'investigate';
```

### SubmissionPayload

```typescript
// TODO: implement in packages/contracts/src/shared/submission.ts
export interface SubmissionPayload {
  patch: string;
  structuredAnswers: Array<{
    questionId: string;
    answer: string;
  }>;
  clientChecksum: string;
}
```

### EvaluationPayload

```typescript
// TODO: implement in packages/contracts/src/evaluator/evaluation.ts
export interface EvaluationPayload {
  id: string;
  submissionId: string;
  attemptId: string;
  patchValid: boolean;
  publicTestsPassed: number;
  publicTestsTotal: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  benchmarksPassed: boolean | null;
  structuredAnswers: StructuredAnswerResult[];
  rubricResults: RubricResult[] | null;
  passed: boolean;
  score: number;
  evidenceType: 'practice' | 'transfer';
  createdAt: string;
}
```

### SkillStatePayload

```typescript
// TODO: implement in packages/contracts/src/learner-model/skill-state.ts
export interface SkillStatePayload {
  skillId: string;
  learnerId: string;
  mastery: number; // 0.0 – 1.0
  alpha: number; // Beta distribution alpha
  beta: number; // Beta distribution beta
  evidenceCount: number;
  lastEvidenceAt: string | null;
  updatedAt: string;
}
```

### SelectorDecision

```typescript
// TODO: implement in packages/contracts/src/selector/decision.ts
export interface SelectorDecision {
  variantId: string;
  skillId: string;
  taskMode: TaskMode;
  difficulty: number;
  predictedSuccessRate: number;
  reason: string;
  fallback: boolean;
  timestamp: string;
}
```

### EvidenceEventPayload

```typescript
// TODO: implement in packages/contracts/src/learner-model/evidence.ts
export interface EvidenceEventPayload {
  id: string;
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

### GradingJobPayload

```typescript
// TODO: implement in packages/contracts/src/evaluator/grading-job.ts
export interface GradingJobPayload {
  jobId: string;
  submissionId: string;
  attemptId: string;
  learnerId: string;
  variantId: string;
  referenceSystemDockerImage: string;
  patch: string;
  structuredAnswers: Array<{ questionId: string; answer: string }>;
  hiddenTestsPath: string;
  resourceLimits: {
    cpuCores: number;
    memoryMb: number;
    timeoutSeconds: number;
  };
  idempotencyKey: string;
  createdAt: string;
}
```

### HintPayload

```typescript
// TODO: implement in packages/contracts/src/shared/hint.ts
export interface HintPayload {
  index: number;
  text: string;
  type: 'authored' | 'ai-worded';
  isLast: boolean;
}
```

### MentorMessage

```typescript
// TODO: implement in packages/contracts/src/ai/mentor.ts
export interface MentorRequestPayload {
  message: string;
  conversationId: string | null;
  attemptId: string;
  factSheet: string;
}

export interface MentorResponsePayload {
  reply: string;
  conversationId: string;
  groundedOn: string[];
}
```

### WeeklyReport

```typescript
// TODO: implement via API response type
export interface WeeklyReportPayload {
  weekOf: string;
  summary: string;
  skillsImproved: string[];
  attemptsCompleted: number;
  transferTasksPassed: number;
  masteryChanges: Array<{
    skillId: string;
    skillName: string;
    delta: number;
  }>;
}
```

---

## Rules for Changing Contracts

1. Open an issue describing the change and why.
2. Create a `contract/<name>` branch.
3. Update the type(s) in this package.
4. Update `API_CONTRACT.md` or `EVENT_CONTRACT.md` if applicable.
5. Notify all affected area owners.
6. Require 2 approvals from affected area owners.
7. Never make a breaking change without a migration plan.

---

## What This Package Must NOT Contain

- Business logic
- Database queries
- API route handlers
- External API calls
- Runtime dependencies (types only)

`packages/contracts` must have zero runtime dependencies.
It is TypeScript types only.
