# Learner Flow Diagram

```mermaid
flowchart TD
    Signup["Signup\n(Supabase Auth)"]
    Goal["Goal Selection\n(what do you want to improve?)"]
    Diagnostic["Diagnostic\n(baseline skill questions)"]
    Profile["Skill Profile\n(mastery initialized)"]
    Selector["Selector\n(picks next task)"]
    Task["Task Presented\n(narrative + instructions)"]
    Working["Working\n(edit code locally)"]
    Hints{"Need a hint?"}
    HintLadder["Hint Ladder\n(authored hints, progressive)"]
    Mentor{"Need mentor?"}
    MentorChat["AI Mentor\n(grounded in fact sheet)"]
    Submit["Submit\n(CLI or web)"]
    Grading["Async Grading\n(Docker + hidden tests)"]
    Evaluated["Evaluation Result\n(pass/fail + score)"]
    Viva["Viva\n(4 questions)"]
    Transfer["Transfer Task\n(AI-off, no mentor)"]
    ProfileUpdate["Profile Updated\n(mastery recalculated)"]
    NextTask["Next Task\n(selector runs again)"]
    WeeklyReport["Weekly Report\n(AI-generated summary)"]

    Signup --> Goal
    Goal --> Diagnostic
    Diagnostic --> Profile
    Profile --> Selector
    Selector --> Task
    Task --> Working
    Working --> Hints
    Hints -- Yes --> HintLadder
    HintLadder --> Working
    Working --> Mentor
    Mentor -- Yes --> MentorChat
    MentorChat --> Working
    Working --> Submit
    Submit --> Grading
    Grading --> Evaluated
    Evaluated --> Viva
    Viva --> Transfer
    Transfer --> ProfileUpdate
    ProfileUpdate --> NextTask
    NextTask --> Selector
    ProfileUpdate --> WeeklyReport
```

---

## Important Notes

- **Selector** runs every time a new task is needed — it does not store a pre-planned curriculum.
- **Mentor** is grounded in the variant's fact sheet. It cannot reveal hidden test details.
- **Transfer task** has no AI mentor available. This tests genuine understanding.
- **Profile update** happens after evidence events are emitted by the evaluator.
- **Weekly report** is generated on a schedule (end of week), not after every task.
