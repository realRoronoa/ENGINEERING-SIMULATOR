# AI Policy

**Owner:** Developer 8 (AI System)
**Status:** Active — all AI use must comply with this policy.

---

## Core Principle

> AI is a support system, not a judge.

AI assists learners and evaluates reasoning. AI does **not** decide whether code is objectively correct. Deterministic execution always takes precedence.

---

## Allowed AI Use

### Online (Real-time, learner-facing)

| Use                                | Details                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Mentor**                         | Socratic, grounded in the task's verified fact sheet and reference code. Must NOT reveal hidden test details. |
| **Hint wording**                   | Final hint wording may be AI-generated, but hint content/structure is authored.                               |
| **Viva follow-ups**                | Dynamic follow-up questions in viva, grounded in learner's answer.                                            |
| **Explanation classification**     | Classify whether a learner's explanation matches expected reasoning.                                          |
| **Rubric-based reasoning grading** | Grade free-text reasoning against a fixed, human-authored rubric.                                             |
| **Weekly report writing**          | Write a personalized weekly summary grounded in learner's actual data.                                        |

### Offline (Content creation, not learner-facing)

| Use                      | Details                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| **Variant drafting**     | Draft new task variant descriptions for human review.                    |
| **Variant critique**     | Critique a draft variant for clarity, difficulty calibration, ambiguity. |
| **Solver checks**        | Verify that a proposed fix actually solves the task (assisted review).   |
| **Explanation drafting** | Draft post-task explanations for human review.                           |

---

## Prohibited AI Use

| Prohibited                                                 | Reason                                     |
| ---------------------------------------------------------- | ------------------------------------------ |
| Deciding whether code is objectively correct               | Principle 4: deterministic evaluation only |
| Generating new problems live for a learner                 | Principle 2: pre-build everything          |
| Generating fake production logs or metrics                 | Principle 5: logs come from running code   |
| Storing or repeating learner secrets/credentials           | Privacy policy                             |
| Making claims not grounded in fact sheet or reference code | Hallucination risk                         |
| Using AI to bypass the hidden test grader                  | Evaluation integrity                       |

---

## Grounding Rules

### Mentor Grounding

The mentor **must** be grounded in:

1. The task's **fact sheet** (verified, human-authored facts about the system)
2. The **reference codebase** (actual running code)
3. The **task instructions**

The mentor **must NOT**:

- Reveal hidden test details
- Hallucinate system behavior not in the fact sheet
- Provide the complete solution

### Rubric-Based Grading Grounding

AI grading of reasoning **must**:

1. Use a **fixed, human-authored rubric** — not invent evaluation criteria
2. Return a **structured result** (rubric item → pass/fail + evidence quote)
3. Be overridable by deterministic signals

---

## Prompt Versioning

- All prompts are versioned in `packages/ai/src/prompts/`
- Prompt changes require a PR and changelog entry
- Format: `prompt-<name>-v<version>.ts`
- Active prompt version is tracked in the `ai_calls` database table

---

## Model Tracking

Every AI call must log to the `ai_calls` table:

| Field            | Details                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `model`          | Model name and version (e.g., `gpt-4o-2024-11-20`)                          |
| `prompt_name`    | Name of the prompt used                                                     |
| `prompt_version` | Version of the prompt                                                       |
| `input_tokens`   | Token count                                                                 |
| `output_tokens`  | Token count                                                                 |
| `latency_ms`     | Latency                                                                     |
| `attempt_id`     | Associated attempt (if applicable)                                          |
| `purpose`        | `mentor` / `viva` / `rubric_grading` / `weekly_report` / `offline_drafting` |
| `cost_usd`       | Estimated cost                                                              |

---

## Token and Cost Tracking

- Total cost per learner session must be trackable.
- Alert if a single session exceeds $0.50 in AI costs.
- Monthly budget alerts must be configured in Phase 3.

---

## Fallback Behavior

| Failure Mode              | Fallback                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------ |
| AI mentor timeout         | Show authored fallback message: "I'm unable to help right now. Try the hint ladder." |
| AI viva follow-up failure | Skip to next authored question                                                       |
| AI rubric grading failure | Mark reasoning as `ungraded`, flag for human review                                  |
| AI weekly report failure  | Show data-only summary without AI narrative                                          |

**Never block the learner's core flow due to an AI failure.**

---

## Hallucination Handling

- Mentor responses grounded in fact sheet are checked at prompt level.
- If a learner reports a mentor response as incorrect, it is flagged for review.
- AI-generated content (offline) goes through human review before publishing.
- AI rubric grades are auditable — the graded reasoning and evidence quote are stored.

---

## Privacy

- Do NOT send learner identifiers (name, email) to the LLM API unnecessarily.
- Use learner ID (opaque UUID) as context.
- Do NOT send the learner's raw submission code to the LLM for correctness judgment.
- Learner conversation with mentor is retained for the duration defined in `PRIVACY.md`.
- Full mentor transcripts must NOT be retained indefinitely.

---

## Security

- API keys stored in environment variables only. Never committed to repository.
- AI service runs with a scoped service token.
- Rate limiting applied to all mentor/viva endpoints.

---

## What AI Must NOT Do

1. Decide if code is correct (tests do this)
2. Generate tasks for learners live
3. Generate fake logs or metrics
4. Access the learner's machine or raw keystrokes
5. Retain full conversation history beyond the defined retention window
6. Replace human review for content publishing
