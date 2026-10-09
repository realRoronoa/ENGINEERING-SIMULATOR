# apps/api — REST API Server

**Owner:** Developer 2 (Backend API)
**Tech:** Node.js, TypeScript

---

## Purpose

The central REST API server. All learner-facing operations go through this service.

Responsibilities:

- Authentication middleware (Supabase JWT verification)
- Request validation and error handling
- Rate limiting
- Route handlers for all MVP endpoints
- Orchestration: calls selector, learner-model, AI, and database
- Async grading job dispatch to queue
- Authorization (learners access only their own data)

---

## Structure

```
apps/api/src/
├── index.ts              # Entry point
├── server.ts             # App setup, middleware registration
├── routes/               # Route handlers
│   ├── onboarding.ts
│   ├── diagnostic.ts
│   ├── sessions.ts
│   ├── attempts.ts
│   ├── submissions.ts
│   ├── viva.ts
│   ├── profile.ts
│   ├── progress.ts
│   ├── flags.ts
│   └── disputes.ts
├── middleware/
│   ├── auth.ts           # JWT verification + learner context
│   ├── rateLimit.ts      # Rate limiting
│   └── errorHandler.ts   # Global error handler
├── services/             # Business logic (calls packages)
│   ├── onboarding.ts
│   ├── diagnostic.ts
│   ├── session.ts
│   ├── attempt.ts
│   ├── grading.ts        # Queue dispatch
│   └── profile.ts
└── types.ts              # Internal API types
```

---

## Endpoints (MVP)

See `API_CONTRACT.md` for full request/response schemas.

| Method | Path                                   | Auth | Sync          | Phase   |
| ------ | -------------------------------------- | ---- | ------------- | ------- |
| `POST` | `/v1/onboarding`                       | JWT  | Sync          | MVP     |
| `POST` | `/v1/diagnostic`                       | JWT  | Sync          | MVP     |
| `POST` | `/v1/sessions`                         | JWT  | Sync          | MVP     |
| `POST` | `/v1/sessions/:id/next`                | JWT  | Sync          | MVP     |
| `GET`  | `/v1/attempts/:id`                     | JWT  | Sync          | MVP     |
| `POST` | `/v1/attempts/:id/hints`               | JWT  | Sync          | MVP     |
| `POST` | `/v1/attempts/:id/mentor`              | JWT  | Sync          | MVP     |
| `POST` | `/v1/attempts/:id/submissions`         | JWT  | **Async 202** | MVP     |
| `GET`  | `/v1/submissions/:id`                  | JWT  | Sync          | MVP     |
| `POST` | `/v1/attempts/:id/viva`                | JWT  | Sync          | MVP     |
| `POST` | `/v1/attempts/:id/viva/answers`        | JWT  | Sync          | MVP     |
| `POST` | `/v1/attempts/:id/abandon`             | JWT  | Sync          | MVP     |
| `POST` | `/v1/flags`                            | JWT  | Sync          | Phase 2 |
| `POST` | `/v1/evaluations/:id/disputes`         | JWT  | Sync          | Phase 2 |
| `GET`  | `/v1/profile/skills`                   | JWT  | Sync          | Phase 2 |
| `GET`  | `/v1/profile/skills/:skillId/evidence` | JWT  | Sync          | Phase 2 |
| `GET`  | `/v1/progress/weekly`                  | JWT  | Sync          | Phase 2 |
| `GET`  | `/health`                              | None | Sync          | MVP     |
| `GET`  | `/health/ready`                        | None | Sync          | MVP     |

**FUTURE endpoints:** See `API_CONTRACT.md` — incidents, professor, assessments.

---

## Dependencies

| Package                  | Usage                                        |
| ------------------------ | -------------------------------------------- |
| `packages/database`      | All DB reads and writes                      |
| `packages/contracts`     | Request/response types                       |
| `packages/selector`      | `POST /v1/sessions/:id/next` — get next task |
| `packages/learner-model` | Diagnostic processing, mastery reads         |
| `packages/ai`            | Mentor, viva follow-ups                      |
| `packages/content`       | Reading hint ladders, fact sheets            |
| Supabase Auth            | JWT verification                             |
| pg-boss                  | Grading job enqueue                          |

---

## Authorization Rules

- Every route validates JWT and extracts `learnerId` from token.
- Attempt, submission, evaluation, evidence — all scoped to `learnerId`.
- A learner requesting another learner's resource receives `403 Forbidden`.
- Admin routes do not exist in MVP.

---

## Error Response Standard

```json
{
  "error": {
    "code": "ATTEMPT_NOT_FOUND",
    "message": "Attempt not found or not accessible.",
    "details": {}
  }
}
```

Standard error codes live in `packages/contracts/api/errors.ts`.

---

## Rate Limiting

| Endpoint                            | Limit                  |
| ----------------------------------- | ---------------------- |
| `POST /v1/attempts/:id/mentor`      | 20 req/min per learner |
| `POST /v1/attempts/:id/submissions` | 5 req/min per learner  |
| `POST /v1/attempts/:id/hints`       | 30 req/min per learner |
| All other endpoints                 | 60 req/min per learner |

---

## What This Developer Must NOT Implement

- Frontend code (belongs to `apps/web`)
- Database migrations (belongs to `packages/database`)
- Grading logic (belongs to `packages/evaluator`)
- Selector algorithm (belongs to `packages/selector`)
- Mastery calculation (belongs to `packages/learner-model`)
- AI prompt logic (belongs to `packages/ai`)
- Content authoring (belongs to `packages/content`)
- Admin routes [FUTURE — Phase 3]
- Incident routes [FUTURE — Phase 5]

---

## Testing Requirements

- Integration tests using Supertest + Vitest.
- Real PostgreSQL test database (not mocked).
- Real Supabase test JWT.
- Test all success paths, error paths, and auth failures.
- Test rate limiting behavior.
- No test should call the real AI service (mock `packages/ai`).
