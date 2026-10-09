# ADR-004: Attempt-Centered API Design

**Status:** Accepted
**Date:** 2024-01
**Authors:** Architecture Team

---

## Context

The API needs to model the learner's interaction with tasks. Options:

1. **Question-centered** — API organized around individual questions or tasks (GET /tasks/:id, POST /tasks/:id/answer)
2. **Attempt-centered** — API organized around the learner's attempt session (POST /attempts, POST /attempts/:id/submit)
3. **Session-centered** — API organized around a session containing multiple tasks

---

## Decision

The API is organized around **Attempts**.

An Attempt represents the learner's complete interaction with one task variant — from receiving it to completing the viva.

---

## Rationale

1. **Rich lifecycle:** The interaction with a task is not a single question/answer. It includes: receiving the task, requesting hints, mentoring, submitting, grading, viva, transfer. An Attempt captures this as a unified entity.

2. **State machine:** The Attempt has a clear lifecycle (`created → started → working → submitted → grading → evaluated → viva → transfer → completed`). Organizing around Attempts makes this state machine explicit and enforceable.

3. **Evidence:** Evidence is attributed to an Attempt, not just a submission. The number of hints used, the viva performance, and the transfer result all contribute to evidence for the same Attempt.

4. **Audit trail:** One Attempt = one complete record of a learner's engagement with one task. This makes dispute resolution, learning analytics, and debugging straightforward.

5. **Multiple submissions:** A learner may submit multiple times on one Attempt (e.g., fix and resubmit). The Attempt groups these.

---

## Consequences

- The Attempt table is the central entity in the data model.
- All other endpoints (hints, mentor, submissions, viva) reference an `attemptId`.
- The frontend must track `attemptId` and pass it to all related API calls.
- The Selector creates an Attempt when it assigns a task. The Attempt ID is returned with the task payload.

---

## Attempt Lifecycle

```
created → started → working → submitted → grading → evaluated → viva → transfer → completed
                                                                                 ↘ abandoned
```

Any state can transition to `abandoned`.
