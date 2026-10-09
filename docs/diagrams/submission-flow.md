# Submission Flow Diagram

```mermaid
sequenceDiagram
    participant L as Learner (CLI/Web)
    participant API as API Server
    participant DB as PostgreSQL
    participant Q as Queue (pg-boss)
    participant W as Grading Worker
    participant D as Docker Container
    participant EM as Evaluator
    participant LM as Learner Model

    L->>API: POST /v1/attempts/:id/submissions\n{ patch, structuredAnswers }
    API->>DB: Create submission (status: queued)
    API->>DB: Update attempt (status: submitted)
    API->>Q: Enqueue grading job (jobId, submissionId, patch)
    API-->>L: 202 Accepted { submissionId, pollingUrl }

    Note over L,API: Learner polls or waits for SSE

    W->>Q: Pick grading job
    W->>D: Start isolated Docker container
    W->>D: Apply learner patch to reference system
    W->>D: Run public tests
    D-->>W: Public test results
    W->>D: Run hidden tests
    D-->>W: Hidden test results
    W->>D: Run benchmarks (if applicable)
    D-->>W: Benchmark results
    W->>EM: Evaluate structured answers (if applicable)
    EM-->>W: Structured answer results
    W->>D: Destroy container

    W->>DB: Create evaluation record
    W->>DB: Update submission (status: complete)
    W->>DB: Update attempt (status: evaluated)
    W->>DB: Emit evidence_events (per skill)
    W->>LM: Trigger mastery update (async)

    Note over W,LM: Evidence consumed by Learner Model

    LM->>DB: Update skill_states

    L->>API: GET /v1/submissions/:id (polling)
    API->>DB: Read submission + evaluation
    API-->>L: 200 { status: complete, evaluation: {...} }
```

---

## Failure Paths

| Failure                 | Worker Behavior              | Learner Sees                     |
| ----------------------- | ---------------------------- | -------------------------------- |
| Docker startup fails    | Retry up to 3x with backoff  | "Grading in progress"            |
| Test runner crashes     | Mark as `grading_error`      | Error message + flag option      |
| Timeout exceeded        | Mark as `timeout`            | "Timed out" + retry option       |
| All retries exhausted   | Mark as `failed`, alert ops  | Error message + support link     |
| AI rubric grading fails | Mark reasoning as `ungraded` | Deterministic result still shown |

---

## Idempotency

- Worker checks for existing evaluation before processing a job.
- Duplicate grading job (same submission) is a no-op if evaluation already exists.
- Grading jobs have an idempotency key: `submission_id`.
