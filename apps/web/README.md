# apps/web — Learner Web Application

**Owner:** Developer 1 (Frontend / Learner Experience)
**Tech:** Next.js 14, TypeScript, React

---

## Purpose

The primary learner-facing web application. Learners use this to:
- Sign up and onboard
- Complete the diagnostic
- View their skill profile
- Receive and work on tasks
- Interact with the AI mentor and hint ladder
- Submit work and view evaluation results
- Complete vivas and transfer tasks
- Track weekly progress

---

## Screens

| Screen | Route | Phase | Status |
|---|---|---|---|
| Landing page | `/` | MVP | [ ] |
| Login / Signup | `/auth/login`, `/auth/signup` | MVP | [ ] |
| Onboarding — Goal selection | `/onboarding/goal` | MVP | [ ] |
| Onboarding — Background | `/onboarding/background` | MVP | [ ] |
| Diagnostic | `/diagnostic` | MVP | [ ] |
| Skill profile | `/profile` | Phase 2 | [ ] |
| Dashboard | `/dashboard` | MVP | [ ] |
| Task workspace | `/tasks/[attemptId]` | MVP | [ ] |
| Evaluation result | `/tasks/[attemptId]/result` | MVP | [ ] |
| Viva | `/tasks/[attemptId]/viva` | MVP | [ ] |
| Transfer task | `/tasks/[attemptId]/transfer` | MVP | [ ] |
| Progress | `/progress` | MVP | [ ] |
| Weekly report | `/progress/weekly` | Phase 2 | [ ] |

---

## Components

| Component | Used In | Status |
|---|---|---|
| `CodeEditor` | Task workspace | [ ] |
| `TerminalOutput` | Task workspace | [ ] |
| `MentorChat` | Task workspace | [ ] |
| `HintPanel` | Task workspace | [ ] |
| `SubmitButton` + `SubmissionStatus` | Task workspace | [ ] |
| `EvaluationResult` | Result page | [ ] |
| `VivaQuestion` | Viva page | [ ] |
| `SkillCard` | Profile, dashboard | [ ] |
| `MasteryBar` | Profile | [ ] |
| `DiagnosticQuestion` | Diagnostic | [ ] |
| `WeeklyReport` | Progress page | [ ] |
| `LoadingState` | All pages | [ ] |
| `ErrorState` | All pages | [ ] |
| `EmptyState` | All pages | [ ] |

---

## API Dependencies

All API calls go to `apps/api`. Types come from `packages/contracts/`.

| Action | Endpoint |
|---|---|
| Onboarding | `POST /v1/onboarding` |
| Diagnostic | `POST /v1/diagnostic` |
| Start session | `POST /v1/sessions` |
| Get next task | `POST /v1/sessions/:id/next` |
| Get attempt | `GET /v1/attempts/:id` |
| Get hint | `POST /v1/attempts/:id/hints` |
| Send mentor message | `POST /v1/attempts/:id/mentor` |
| Submit | `POST /v1/attempts/:id/submissions` |
| Poll result | `GET /v1/submissions/:id` |
| Start viva | `POST /v1/attempts/:id/viva` |
| Answer viva | `POST /v1/attempts/:id/viva/answers` |
| Abandon | `POST /v1/attempts/:id/abandon` |
| Flag problem | `POST /v1/flags` |
| Dispute evaluation | `POST /v1/evaluations/:id/disputes` |
| Get skill profile | `GET /v1/profile/skills` |
| Get skill evidence | `GET /v1/profile/skills/:skillId/evidence` |
| Weekly progress | `GET /v1/progress/weekly` |

---

## State Management

- **Auth state:** Managed by Supabase Auth client. JWT stored in cookie.
- **Attempt state:** URL-driven (`/tasks/[attemptId]`). Attempt data fetched from API.
- **Mentor conversation:** Local state within session. Not persisted beyond the session.
- **Submission polling:** `useInterval` or SWR polling on `GET /v1/submissions/:id`.
- **No global state library required for MVP.** Use React context sparingly.

---

## Acceptance Criteria

A screen is complete when:
1. All data is fetched from the real API (no mocks)
2. Loading state is shown while fetching
3. Error state is shown on API failure
4. Empty state is shown where applicable
5. Auth is checked — unauthenticated users redirected to login
6. Learner can only access their own attempts (enforced by API, but also checked client-side)
7. Accessible (ARIA labels, keyboard navigation for core flows)

---

## What This Developer Must NOT Implement

- API business logic (belongs to `apps/api`)
- Database queries (belongs to `packages/database`)
- Grading logic (belongs to `packages/evaluator`)
- AI logic (belongs to `packages/ai`)
- Any content authoring tools (belongs to `packages/content`)
- Admin dashboard [FUTURE — Phase 3]
- Mobile app [FUTURE]
- Professor/cohort views [FUTURE — Phase 3]
- Replay tool [FUTURE — Phase 4]
- Real-time collaborative editing [FUTURE]

---

## Security Requirements

- Never store JWT in localStorage (use httpOnly cookies or Supabase session).
- Never expose other learners' attempt data.
- Never display hidden test content.
- Rate limiting on mentor messages is enforced by the API — do not add artificial delays on the client.

---

## Testing Requirements

- Component tests for all screens using Vitest + Testing Library.
- Test loading, error, and empty states explicitly.
- Test authenticated and unauthenticated states.
- No tests that call the real API or database.
