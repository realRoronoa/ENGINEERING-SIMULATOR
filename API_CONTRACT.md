# API Contract

**Owner:** Developer 2 (Backend API)
**Contract Owner:** All developers — changes require 2 reviewer approvals.

> **Rule:** Change the contract first, then update implementations.

---

## Base URL

```
/v1
```

---

## Authentication

All endpoints require `Authorization: Bearer <jwt>` unless marked `[public]`.

Learners may only access their own resources. Unauthorized access returns `403`.

---

## Error Response Format

All errors return:

```json
{
  "error": {
    "code": "ATTEMPT_NOT_FOUND",
    "message": "Human-readable message",
    "details": {}
  }
}
```

---

## Endpoints

---

### POST /v1/onboarding

**Purpose:** Complete learner onboarding — set goal, background.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates or updates `learners` record; triggers diagnostic session creation.

**Request:**

```json
{
  "goal": "get-a-job | improve-skills | interview-prep",
  "currentRole": "student | junior | mid | senior",
  "yearsExperience": 1,
  "targetStack": ["node", "typescript", "postgresql"]
}
```

**Response: 201**

```json
{
  "learnerId": "uuid",
  "diagnosticSessionId": "uuid",
  "nextStep": "diagnostic"
}
```

**Errors:** `400 VALIDATION_ERROR`, `409 ALREADY_ONBOARDED`

---

### POST /v1/diagnostic

**Purpose:** Submit diagnostic answers; returns initial skill profile.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates evidence events; initializes `skill_states`; creates first session.

**Request:**

```json
{
  "diagnosticSessionId": "uuid",
  "answers": [{ "questionId": "uuid", "answer": "string | string[]" }]
}
```

**Response: 200**

```json
{
  "skillProfile": [
    {
      "skillId": "uuid",
      "skillName": "string",
      "masteryEstimate": 0.0,
      "confidence": "low | medium | high"
    }
  ],
  "sessionId": "uuid",
  "nextStep": "task"
}
```

**Errors:** `400 VALIDATION_ERROR`, `404 DIAGNOSTIC_SESSION_NOT_FOUND`, `409 DIAGNOSTIC_ALREADY_COMPLETE`

---

### POST /v1/sessions

**Purpose:** Start a new learning session.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates `sessions` record.

**Request:**

```json
{
  "mode": "practice | debug | build | transfer"
}
```

**Response: 201**

```json
{
  "sessionId": "uuid",
  "createdAt": "iso8601"
}
```

**Errors:** `400 VALIDATION_ERROR`

---

### POST /v1/sessions/:id/next

**Purpose:** Get the next task for this session (calls selector).

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates `attempts` record (status: `created`).

**Request:** (empty body)

**Response: 201**

```json
{
  "attemptId": "uuid",
  "task": {
    "id": "uuid",
    "variantId": "uuid",
    "title": "string",
    "narrative": "string",
    "instructions": "string",
    "mode": "debug | build | fix | investigate",
    "difficulty": 1,
    "skillIds": ["uuid"],
    "estimatedMinutes": 30,
    "factSheet": "string (markdown)",
    "referenceSystem": {
      "name": "shopverse",
      "dockerImage": "string"
    }
  },
  "selectorReason": "string"
}
```

**Errors:** `404 SESSION_NOT_FOUND`, `409 SESSION_HAS_ACTIVE_ATTEMPT`, `503 NO_TASKS_AVAILABLE`

---

### GET /v1/attempts/:id

**Purpose:** Get attempt state and current task details.

**Auth:** JWT (learner — own attempts only)
**Sync:** Synchronous
**DB Impact:** Read only.

**Response: 200**

```json
{
  "attempt": {
    "id": "uuid",
    "status": "created | started | working | submitted | grading | evaluated | viva | transfer | completed | abandoned",
    "variantId": "uuid",
    "sessionId": "uuid",
    "startedAt": "iso8601 | null",
    "completedAt": "iso8601 | null",
    "hintsUsed": 0,
    "submissionsCount": 0
  }
}
```

**Errors:** `404 ATTEMPT_NOT_FOUND`, `403 FORBIDDEN`

---

### POST /v1/attempts/:id/hints

**Purpose:** Request the next hint for this attempt.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates `hint_events` record; increments hint counter.

**Request:**

```json
{
  "currentHintIndex": 0
}
```

**Response: 200**

```json
{
  "hint": {
    "index": 1,
    "text": "string",
    "type": "authored | ai-worded",
    "isLast": false
  }
}
```

**Errors:** `404 ATTEMPT_NOT_FOUND`, `409 ALL_HINTS_EXHAUSTED`, `403 FORBIDDEN`

---

### POST /v1/attempts/:id/mentor

**Purpose:** Send a message to the AI mentor for this attempt.

**Auth:** JWT (learner)
**Sync:** Synchronous (with timeout)
**DB Impact:** Stores mentor exchange in `ai_calls`.

**Request:**

```json
{
  "message": "string",
  "conversationId": "uuid | null"
}
```

**Response: 200**

```json
{
  "reply": "string",
  "conversationId": "uuid",
  "groundedOn": ["fact-1", "fact-2"]
}
```

**Errors:** `404 ATTEMPT_NOT_FOUND`, `403 FORBIDDEN`, `503 AI_UNAVAILABLE`, `429 RATE_LIMITED`

---

### POST /v1/attempts/:id/submissions

**Purpose:** Submit code for grading.

**Auth:** JWT (learner)
**Sync:** Asynchronous — returns 202
**DB Impact:** Creates `submissions` record; enqueues grading job.

**Request:**

```json
{
  "patch": "string (unified diff format)",
  "structuredAnswers": [{ "questionId": "uuid", "answer": "string" }],
  "clientChecksum": "string"
}
```

**Response: 202**

```json
{
  "submissionId": "uuid",
  "status": "queued",
  "pollingUrl": "/v1/submissions/uuid"
}
```

**Errors:** `400 INVALID_PATCH`, `403 FORBIDDEN`, `404 ATTEMPT_NOT_FOUND`, `409 ATTEMPT_NOT_IN_WORKING_STATE`, `429 SUBMISSION_RATE_LIMITED`

---

### GET /v1/submissions/:id

**Purpose:** Poll grading status and result.

**Auth:** JWT (learner)
**Sync:** Synchronous (polling)
**DB Impact:** Read only.

**Response: 200**

```json
{
  "submissionId": "uuid",
  "status": "queued | grading | complete | failed | timeout",
  "evaluation": {
    "id": "uuid",
    "passed": true,
    "score": 0.85,
    "publicTestsPassed": 5,
    "publicTestsTotal": 5,
    "hiddenTestsPassed": 8,
    "hiddenTestsTotal": 10,
    "benchmarksPassed": null,
    "rubricResults": [],
    "feedback": "string"
  } | null
}
```

**Errors:** `404 SUBMISSION_NOT_FOUND`, `403 FORBIDDEN`

---

### POST /v1/attempts/:id/viva

**Purpose:** Start the viva (post-evaluation oral follow-up).

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates `viva_records` record; updates attempt status to `viva`.

**Response: 201**

```json
{
  "vivaId": "uuid",
  "firstQuestion": {
    "id": "uuid",
    "text": "string",
    "type": "authored | ai-followup"
  }
}
```

**Errors:** `404 ATTEMPT_NOT_FOUND`, `409 ATTEMPT_NOT_IN_EVALUATED_STATE`, `403 FORBIDDEN`

---

### POST /v1/attempts/:id/viva/answers

**Purpose:** Submit an answer to a viva question.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Updates `viva_records`; triggers AI rubric grading if applicable.

**Request:**

```json
{
  "vivaId": "uuid",
  "questionId": "uuid",
  "answer": "string"
}
```

**Response: 200**

```json
{
  "nextQuestion": {
    "id": "uuid",
    "text": "string",
    "type": "authored | ai-followup"
  } | null,
  "vivaComplete": false
}
```

**Errors:** `404 ATTEMPT_NOT_FOUND`, `403 FORBIDDEN`, `409 VIVA_NOT_STARTED`

---

### POST /v1/attempts/:id/abandon

**Purpose:** Mark an attempt as abandoned.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Updates attempt status to `abandoned`.

**Response: 200**

```json
{
  "attemptId": "uuid",
  "status": "abandoned"
}
```

**Errors:** `404 ATTEMPT_NOT_FOUND`, `403 FORBIDDEN`, `409 ATTEMPT_ALREADY_COMPLETED`

---

### POST /v1/flags

**Purpose:** Learner reports a problem with a task or evaluation.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates `flags` record.

**Request:**

```json
{
  "attemptId": "uuid",
  "type": "incorrect-test | unclear-instructions | wrong-answer | other",
  "description": "string"
}
```

**Response: 201**

```json
{
  "flagId": "uuid",
  "status": "open"
}
```

---

### POST /v1/evaluations/:id/disputes

**Purpose:** Learner disputes an evaluation result.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Creates `disputes` record.

**Request:**

```json
{
  "reason": "string",
  "evidenceDescription": "string"
}
```

**Response: 201**

```json
{
  "disputeId": "uuid",
  "status": "open"
}
```

**Errors:** `404 EVALUATION_NOT_FOUND`, `403 FORBIDDEN`, `409 DISPUTE_ALREADY_EXISTS`

---

### GET /v1/profile/skills

**Purpose:** Get the learner's current skill profile.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Read only from `skill_states`.

**Response: 200**

```json
{
  "skills": [
    {
      "skillId": "uuid",
      "skillName": "string",
      "mastery": 0.65,
      "confidence": "low | medium | high",
      "attemptsCount": 5,
      "lastAttemptAt": "iso8601"
    }
  ]
}
```

---

### GET /v1/profile/skills/:skillId/evidence

**Purpose:** Get evidence supporting mastery for a specific skill.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Read only from `evidence_events`.

**Response: 200**

```json
{
  "skillId": "uuid",
  "evidence": [
    {
      "id": "uuid",
      "evidenceType": "practice | transfer | diagnostic",
      "passed": true,
      "score": 0.9,
      "difficulty": 2,
      "timestamp": "iso8601"
    }
  ]
}
```

---

### GET /v1/progress/weekly

**Purpose:** Get the learner's weekly progress report.

**Auth:** JWT (learner)
**Sync:** Synchronous
**DB Impact:** Read only from `weekly_reports`.

**Response: 200**

```json
{
  "weekOf": "iso8601",
  "summary": "string (AI-generated narrative, grounded in data)",
  "skillsImproved": ["string"],
  "attemptsCompleted": 5,
  "transferTasksPassed": 1,
  "masteryChanges": [{ "skillId": "uuid", "skillName": "string", "delta": 0.1 }]
}
```

---

## FUTURE Endpoints (Do Not Implement)

> These endpoints are documented for planning only. Do not build until the indicated phase.

| Endpoint                             | Phase   | Notes                     |
| ------------------------------------ | ------- | ------------------------- |
| `GET /v1/incidents`                  | Phase 5 | Production incident tasks |
| `POST /v1/incidents/:id/investigate` | Phase 5 | Investigate mode          |
| `POST /v1/incidents/:id/fix`         | Phase 5 | Fix mode                  |
| `POST /v1/incidents/:id/postmortem`  | Phase 5 | Postmortem grading        |
| `GET /v1/admin/content`              | Phase 3 | Admin content review      |
| `GET /v1/admin/flags`                | Phase 3 | Admin flag inbox          |
| `GET /v1/professor/cohorts`          | Phase 3 | Professor dashboard       |
| `GET /v1/assessments/:id`            | Phase 6 | Company assessments       |
