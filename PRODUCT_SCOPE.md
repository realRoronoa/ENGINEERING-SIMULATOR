# Product Scope

## What Engineering Simulator Is

A structured engineering practice platform. Learners work on real engineering tasks against a real reference codebase, receive deterministically graded feedback, and build demonstrable, verified skill over time.

It is **not** a generic AI tutor.
It is **not** a course or video platform.
It is **not** a quiz app.

---

## MVP (Phase 1–2)

The smallest useful product:

| Item | Detail |
|---|---|
| Learning tracks | 1 — Backend / Node.js |
| Reference codebase | 1 — Shopverse |
| Skills | 12 |
| Task templates | 15 |
| Validated variants | ~60 |
| Grading | Hidden-test deterministic grading |
| AI features | AI mentor, hint wording, viva follow-ups, rubric-based reasoning grading |
| Viva | 4-question oral-style follow-up |
| Transfer task | AI-off, separate graded task |
| Execution | Local Docker |
| Submission | CLI |
| Learner app | Web application |
| Auth | Supabase JWT |
| Personalization | Rule-based selector, Beta mastery model |

---

## What is Explicitly NOT in MVP

> These must not be built. If you are tempted to build any of the following, open an issue first.

| Out of Scope | Reason |
|---|---|
| Live problem generation | Principle 2: pre-build everything |
| Hosted learner sandboxes | Phase 5 |
| Production incidents | Phase 5 |
| Complex ML personalization | Phase 4 |
| Mobile app | Future |
| College dashboard | Phase 3 |
| Company hiring product | Phase 6 |
| Kubernetes | Phase 5+ |
| Multi-region | Phase 6+ |
| Second programming stack (Python) | Phase 6 |
| Advanced analytics | Phase 3+ |
| Admin dashboard (full) | Phase 3 |
| Automated variant generation pipeline (full) | Phase 2 (partial only) |
| Spaced repetition scheduling | Phase 4 |
| Explanation-first vs try-first mode | Phase 4 |
| Proctored AI-off mode | Phase 5 |
| Replay tool | Phase 4 |
| Professor dashboard | Phase 3 |

---

## Product Principles

These are encoded in the architecture and must be respected by every developer.

### PRINCIPLE 1 — Humans author knowledge; machines create variety.
Skill graphs, task templates, fault patterns, and rubrics are **human-authored**.
LLMs may assist in drafting variants, but humans validate and approve them.

### PRINCIPLE 2 — Every learner-facing problem must be pre-built and pre-validated.
**Never generate a new problem live while a learner is waiting.**
The system selects from a pre-validated library. It does not invent tasks on demand.

### PRINCIPLE 3 — Personalization = selection + difficulty + support + memory.
Personalization does NOT mean a unique problem for every learner.
It means: selecting the right pre-built task, at the right difficulty, with the right support level, given learner history.

### PRINCIPLE 4 — Deterministic evaluation comes before AI.
Tests, benchmarks, and structured answers decide objective correctness.
LLMs may evaluate **explanations**, **design reasoning**, and **free-text reasoning** against fixed rubrics.
**LLMs must NOT decide whether code is objectively correct.**

### PRINCIPLE 5 — Logs and metrics must come from running code.
**Do not generate fake production logs using an LLM.**
All diagnostic signals (latency, errors, traces) come from actually running code in Docker.

### PRINCIPLE 6 — Measure learning with AI-off transfer pass rate.
Long-term success is measured by:
- **AI-off transfer pass rate**: can the learner solve a new problem without the mentor?
- **Calibrated difficulty solved over time**: are they solving harder problems?
Not just: did they pass this practice task?

---

## First Track: Backend Engineering

### Stack
- Node.js
- TypeScript
- PostgreSQL
- (Redis — Phase 5)

### Reference System
- Shopverse (realistic e-commerce backend)

### Initial Skills (12)
> To be defined by Developer 4 (Content). Placeholder list:
1. Database query design
2. API error handling
3. N+1 query detection and fix
4. Index design
5. Transaction correctness
6. Connection pool management
7. Cache invalidation
8. Queue and worker patterns
9. Rate limiting
10. Authentication middleware
11. Pagination
12. Background job reliability

### Python Stack
**FUTURE — Phase 6.** Do not prepare Python infrastructure now.

---

## Learner Experience Summary

```
Signup
  └─ Goal selection (what do you want to get better at?)
       └─ Diagnostic (baseline skill assessment)
            └─ Skill Profile (what do we know about you?)
                 └─ Task assigned (by selector)
                      ├─ Mentor available (AI, grounded)
                      ├─ Hint ladder (structured, authored)
                      └─ Submit
                           └─ Evaluation (deterministic first)
                                └─ Viva (4 questions)
                                     └─ Transfer task (AI-off)
                                          └─ Profile updated
                                               └─ Next task (selector decides)
                                                    └─ Weekly report
```
