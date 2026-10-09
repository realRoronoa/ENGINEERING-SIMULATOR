# Task Lifecycle

This document describes the complete lifecycle of a task — from creation by content authors to completion by a learner.

---

## Phase 1 — Content Authoring (Offline)

```
1. Template Creation
   Author creates a TaskTemplate:
   - Defines learning objective
   - Specifies skill, mode, difficulty range
   - References a ReferenceSystem and FaultPattern (if applicable)

2. Variant Creation
   Author creates a Variant from the template:
   - Writes learner narrative
   - Writes task instructions
   - Defines initial code state
   - Writes fact sheet (verified facts for mentor)
   - Writes hint ladder (authored hints)
   - Writes post-task explanation
   - Assigns viva questions
   - Links rubric (if applicable)
   - Maps misconceptions

3. Hidden Test Authoring
   Developer 5 (Evaluator) authors hidden tests:
   - Tests are stored separately from learner-visible files
   - Tests must be runnable in the Docker reference system
   - Tests must be deterministic

4. Reference Fix Authoring
   Author provides the canonical fix:
   - The correct solution against which hidden tests pass
   - Used to validate the test suite

5. Validation
   Content validation scripts run:
   - Fix applies cleanly to reference system
   - All hidden tests pass with the fix applied
   - All hidden tests FAIL without the fix (or appropriate subset)
   - Hint ladder has correct number of hints
   - Fact sheet is verified against reference code
   - Viva questions are complete

6. Review
   Human reviewer (content owner + one other) checks:
   - Clarity of instructions
   - Difficulty calibration
   - Hint ladder quality
   - Viva question quality
   - Rubric completeness

7. Publish
   Status set to 'published'.
   published_at timestamp set.
   Record becomes immutable.
   Variant enters the Active pool.
```

---

## Phase 2 — Selection (At Learner Request)

```
8. Selector Decision
   Learner requests next task via POST /v1/sessions/:id/next.
   Selector reads:
   - Learner skill states
   - Skill graph (prerequisites)
   - Detected misconceptions
   - Session mode
   - Selector targets ~70% predicted success rate
   Selector returns:
   - variant_id
   - difficulty
   - selector_reason (logged, shown to learner in Phase 4)

9. Attempt Created
   API creates an Attempt record (status: 'created').
   Task payload returned to learner.
```

---

## Phase 3 — Attempt (Learner Working)

```
10. Attempt Started
    Learner receives task.
    CLI downloads task environment.
    Attempt status → 'started', then 'working'.

11. Hints
    Learner may request hints.
    Each hint request:
    - Returns next authored hint
    - Creates hint_event record
    - Increments hints_used

12. Mentor
    Learner may ask mentor questions.
    Mentor:
    - Grounded in fact sheet + reference code
    - Does NOT reveal hidden test details
    - AI call logged in ai_calls

13. Submission
    Learner submits via CLI or web.
    POST /v1/attempts/:id/submissions
    - Submission record created (status: queued)
    - Attempt status → 'submitted'
    - Returns 202 with pollingUrl
```

---

## Phase 4 — Grading (Async)

```
14. Grading Job
    Worker picks job from queue.

15. Environment Preparation
    Isolated Docker container started.
    Reference system initialized.
    Learner's patch applied.

16. Test Execution
    Public tests run.
    Hidden tests run.
    Benchmarks run (if applicable).

17. Structured Answer Evaluation
    Learner's structured answers evaluated against authored answer key.

18. Evaluation Record Created
    Deterministic evaluation stored.
    Submission status → 'complete' | 'failed' | 'timeout'.
    Attempt status → 'evaluated' (if tests ran).

19. AI Rubric Grading (if applicable)
    If task includes reasoning grading:
    - AI rubric grader invoked
    - Uses fixed, human-authored rubric
    - Result appended to evaluation

20. Evidence Events Emitted
    EvidenceEvent records created for each relevant skill.

21. API Notified
    Attempt status updated.
    Learner polls GET /v1/submissions/:id or receives SSE.
```

---

## Phase 5 — Viva

```
22. Viva Started
    POST /v1/attempts/:id/viva
    - VivaRecord created
    - Attempt status → 'viva'
    - First authored viva question returned

23. Viva Answers
    POST /v1/attempts/:id/viva/answers
    - Learner answers each question
    - AI may ask follow-up questions (grounded, dynamic)
    - Answers stored in viva_records

24. Viva Complete
    All questions answered.
    AI rubric grading of reasoning answers triggered.
    Viva evidence events emitted.
```

---

## Phase 6 — Transfer

```
25. Transfer Task Assigned
    A separate transfer task variant is selected.
    AI mentor is NOT available for transfer tasks.
    Hint ladder may be restricted.

26. Transfer Submitted
    Same grading flow as primary submission.

27. Transfer Evidence Emitted
    Transfer evidence events weighted higher in mastery model.
```

---

## Phase 7 — Profile Update

```
28. Learner Model Update
    Evidence events consumed by Learner Model.
    skill_states updated (alpha/beta params updated).
    Mastery recalculated.
    Misconceptions updated if detected.

29. Attempt Completed
    Attempt status → 'completed'.
    completedAt set.
    Session updated.
```

---

## Phase 8 — Statistics Update

```
30. Variant Statistics Updated
    item_stats record updated:
    - attempts_count incremented
    - pass_rate recalculated
    - avg_score, avg_hints_used, avg_time updated
    - calibrated_difficulty updated (Phase 4)
```

---

## Attempt Status Lifecycle

```
created
  ↓
started
  ↓
working
  ↓
submitted
  ↓
grading
  ↓
evaluated ──→ viva ──→ transfer ──→ completed
                                         ↑
                              (if no transfer: directly)

Any non-completed status can transition to:
  ↓
abandoned
```

---

## Important Rules

1. **No task is ever generated live.** Selection happens only from the published variant pool.
2. **Published variants are immutable.** A fix creates a new version (new row, new ID).
3. **Evaluations are append-only.** Disputes create a separate record.
4. **Evidence events are append-only.** Mastery is derived from events, not stored directly.
5. **Transfer evidence is weighted higher** than practice evidence in the mastery model.
6. **Diagnostic evidence is weighted differently** from practice evidence.
