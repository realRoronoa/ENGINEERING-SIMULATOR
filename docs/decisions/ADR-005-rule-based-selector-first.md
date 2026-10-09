# ADR-005: Rule-Based Selector First

**Status:** Accepted
**Date:** 2024-01
**Authors:** Architecture Team

---

## Context

The platform needs to select the next task for each learner. Options:

1. **Machine learning recommendation** — train a model on learner behavior to predict the best next task
2. **Rule-based selector** — explicit, interpretable rules that select the next task based on mastery state
3. **Static curriculum** — fixed order, same for every learner

---

## Decision

We will implement a **rule-based selector** for MVP and Phase 2.

ML-based selection is explicitly deferred to Phase 4.

---

## Rationale

1. **Debuggability:** Rule-based selection is inspectable. When a learner gets an unexpected task, we can explain exactly why. ML models are opaque.

2. **Data requirements:** A good ML recommender needs substantial behavioral data. At MVP, we have no data. Rule-based selection works from day 1.

3. **Correctability:** If the rule-based selector makes a wrong decision, we can fix the rule. Fixing a trained ML model requires retraining.

4. **Interpretability for learners:** In Phase 4, we want to show learners "why this task?" A rule-based selector makes this trivial. An ML model requires additional explanation machinery.

5. **Speed:** Building a good ML selector takes months. A rule-based selector can be built in days and iterated quickly.

6. **Good enough:** A well-designed rule-based selector targeting ~70% predicted success rate, with prerequisite enforcement, is a significant improvement over random selection or a static curriculum.

---

## Initial Selection Logic

```
1. Find relevant skills for the learner's goal
2. Remove skills whose prerequisites are not satisfied
3. Prioritize skills by: low mastery + high relevance to goal
4. Check for active misconceptions → bias toward misconception-targeting tasks
5. Select task mode (debug, build, fix) based on skill and learner history
6. Select difficulty to target ~70% predicted success rate
7. Select a suitable variant (not recently seen, appropriate difficulty)
8. Return: variant + SelectorDecision (reason, skill, mode, difficulty)
```

---

## Consequences

- The "learning path" is NOT stored as a static roadmap. It is derived from learner state at selection time.
- The Selector must handle the case where no suitable variant is available (fallback to any available variant; alert content team).
- SelectorDecision must be stored with each Attempt for audit and future ML training data.
- Mastery model quality (Developer 6) directly affects selector quality.

---

## Future

Phase 4: Extend to ML-based difficulty targeting, variant calibration, and misconception-driven selection. The rule-based selector becomes the fallback when the ML model lacks confidence.
