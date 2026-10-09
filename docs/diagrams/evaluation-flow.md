# Evaluation Flow Diagram

```mermaid
flowchart TD
    Job["Worker picks grading job\nfrom queue"]
    Idempotent{"Evaluation\nalready exists?"}
    Done["Skip — no-op\n(idempotent)"]
    Validate["Validate patch\n(does it apply cleanly?)"]
    PatchFail["Evaluation:\npatch_valid = false\npassed = false"]
    StartDocker["Start isolated Docker container\n(reference system)"]
    ApplyPatch["Apply learner patch\nto reference system"]
    PublicTests["Run public tests"]
    HiddenTests["Run hidden tests"]
    HasBench{"Task has\nbenchmarks?"}
    Benchmarks["Run benchmarks\ncheck thresholds"]
    HasStructured{"Task has\nstructured answers?"}
    StructuredEval["Evaluate structured answers\nagainst authored answer key"]
    DestroyContainer["Destroy Docker container"]
    HasRubric{"Task has\nrubric grading?"}
    RubricGrading["AI Rubric Grading\n(reasoning/explanation only)"]
    RubricFail["Mark reasoning as ungraded\n(do not block pass/fail)"]
    CreateEval["Create evaluation record\nin database"]
    EmitEvidence["Emit evidence_events\nper skill"]
    UpdateAttempt["Update attempt status\n→ evaluated"]
    NotifyAPI["Update submission status\n→ complete\n(learner polls or SSE)"]

    Job --> Idempotent
    Idempotent -- Yes --> Done
    Idempotent -- No --> Validate
    Validate -- Invalid --> PatchFail
    Validate -- Valid --> StartDocker
    PatchFail --> CreateEval
    StartDocker --> ApplyPatch
    ApplyPatch --> PublicTests
    PublicTests --> HiddenTests
    HiddenTests --> HasBench
    HasBench -- Yes --> Benchmarks
    HasBench -- No --> HasStructured
    Benchmarks --> HasStructured
    HasStructured -- Yes --> StructuredEval
    HasStructured -- No --> DestroyContainer
    StructuredEval --> DestroyContainer
    DestroyContainer --> HasRubric
    HasRubric -- Yes --> RubricGrading
    HasRubric -- No --> CreateEval
    RubricGrading -- Success --> CreateEval
    RubricGrading -- Failure --> RubricFail
    RubricFail --> CreateEval
    CreateEval --> EmitEvidence
    EmitEvidence --> UpdateAttempt
    UpdateAttempt --> NotifyAPI
```

---

## Evaluation Decision Rule

```
passed = (patch_valid == true)
       AND (hidden_tests_passed == hidden_tests_total)
       AND (benchmarks_passed OR benchmarks_passed == null)
       AND (structured_answers_all_correct OR no_structured_answers)
```

**AI rubric results do NOT block the `passed` decision for MVP.**
They are additional evidence stored alongside the evaluation.
