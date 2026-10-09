# apps/worker — Grading Worker

**Owner:** Developer 5 (Evaluation / Grading)
**Tech:** Node.js, TypeScript, Docker SDK

---

## Purpose

The async grading worker. It picks grading jobs from the queue, executes learner code in isolated Docker containers, and produces evaluation results.

---

## Responsibilities

- Poll the grading queue (pg-boss) for new jobs
- Spin up isolated Docker containers per grading job
- Apply learner's patch to the reference system
- Execute public tests, hidden tests, and benchmarks
- Create evaluation records in the database
- Emit evidence events for the Learner Model
- Handle retries, timeouts, and failure states
- Destroy containers after each job (no shared state)

---

## Structure

```
apps/worker/src/
├── index.ts           # Entry point — start worker, connect to queue
├── worker.ts          # Job processor — main loop
├── docker/
│   ├── manager.ts     # Docker container lifecycle
│   └── runner.ts      # Test execution inside container
├── jobs/
│   └── grading.ts     # Grading job handler
└── types.ts           # Internal worker types
```

---

## Grading Job Flow

```
Pick job from queue
→ Check idempotency (evaluation already exists? skip)
→ Validate patch
→ Start Docker container
→ Apply patch
→ Run public tests
→ Run hidden tests
→ Run benchmarks (if applicable)
→ Destroy container
→ Evaluate structured answers
→ Create evaluation record
→ Emit evidence events
→ Update submission + attempt status
→ Complete job
```

---

## Container Constraints (MVP Defaults)

| Constraint | Default |
|---|---|
| CPU cores | 0.5 |
| Memory | 512 MB |
| Execution timeout | 60 seconds |
| Network access | Internal only (no external network) |
| Filesystem | Read-only except task directory |

---

## Retry Policy

| Failure Type | Max Retries | Backoff |
|---|---|---|
| Docker startup failure | 3 | Exponential (1s, 5s, 30s) |
| Test runner crash | 2 | Fixed (10s) |
| Timeout | 0 | No retry |
| Unknown error | 2 | Exponential |

After all retries: mark submission as `failed`, log error, alert ops.

---

## Dependencies

| Package | Usage |
|---|---|
| `packages/evaluator` | Core grading logic |
| `packages/database` | Read variants, write evaluations and evidence |
| `packages/contracts` | Job and evaluation types |
| Docker SDK | Container management |
| pg-boss | Queue consumption |

---

## What This Developer Must NOT Implement

- API route handlers (belongs to `apps/api`)
- Frontend code (belongs to `apps/web`)
- Mastery model updates (belongs to `packages/learner-model` — worker emits events, LM consumes)
- AI rubric grading (belongs to `packages/ai` — evaluator calls it, not worker directly)
- Content authoring (belongs to `packages/content`)
- Hosted sandboxes [FUTURE — Phase 5]
- Postmortem grading [FUTURE — Phase 5]

---

## Security Requirements

- Worker runs with a service token — not accessible from the public internet.
- Docker containers must not have access to the host filesystem beyond the task directory.
- Containers must not have unrestricted internet access.
- Worker does not read or store learner PII beyond the attempt ID.

---

## Testing Requirements

- Unit tests for grading logic in `packages/evaluator`.
- Integration tests for the full grading job lifecycle using real Docker.
- Test success path, patch failure path, timeout path, and retry path.
- CI runs Docker-based tests on merge to `develop` (slower job).
