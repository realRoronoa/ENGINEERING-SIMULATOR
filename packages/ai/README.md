# packages/ai — AI Integration Layer

**Owner:** Developer 8 (AI System)
**Tech:** Node.js, TypeScript, OpenAI API

---

## Purpose

All AI interactions in the system go through this package. It is the only place where LLM API calls are made.

This package implements:

- AI mentor (online, grounded in fact sheets)
- Viva follow-up question generation
- Rubric-based reasoning grading
- Weekly report generation
- Offline content tools (variant drafting, critique)

---

## Responsibilities

### Online (Real-time, learner-facing)

- Mentor: answer learner questions grounded in fact sheet + reference code
- Viva: generate dynamic follow-up questions from learner answers
- Rubric grading: grade reasoning and explanations against fixed rubrics
- Weekly report: generate personalized narrative grounded in real data

### Offline (Content creation, not learner-facing)

- Variant drafting: assist content author in drafting variant text
- Variant critique: critique a draft for clarity, difficulty, ambiguity
- Explanation drafting: draft post-task explanations for human review

---

## Structure

```
packages/ai/src/
├── index.ts                   # Public exports
├── client.ts                  # OpenAI client setup, retry, logging
├── mentor/
│   ├── mentor.ts              # Mentor message handler
│   └── grounding.ts           # Fact sheet grounding logic
├── viva/
│   └── followup.ts            # Viva follow-up question generation
├── rubric/
│   └── grader.ts              # Rubric-based reasoning grader
├── reports/
│   └── weekly.ts              # Weekly report generation
├── offline/
│   ├── drafter.ts             # Variant draft generation
│   └── critic.ts              # Variant critique
├── prompts/
│   ├── mentor-v1.ts           # Prompt: mentor system prompt
│   ├── viva-followup-v1.ts    # Prompt: viva follow-up
│   ├── rubric-grader-v1.ts    # Prompt: rubric grading
│   └── weekly-report-v1.ts    # Prompt: weekly report
├── logger.ts                  # AI call logging → ai_calls table
└── types.ts                   # Internal AI types
```

---

## Public API

```typescript
// TODO: implement

// Online: mentor
export async function sendMentorMessage(
  input: MentorRequestPayload
): Promise<MentorResponsePayload>;

// Online: viva follow-up
export async function generateVivaFollowup(
  question: string,
  learnerAnswer: string,
  context: VivaContext
): Promise<string>;

// Online: rubric grading
export async function gradeWithRubric(
  learnerText: string,
  rubric: Rubric
): Promise<RubricGradingResult>;

// Online: weekly report
export async function generateWeeklyReport(data: WeeklyReportData): Promise<string>;
```

---

## Grounding Rules (CRITICAL)

### Mentor Grounding

The mentor system prompt must include:

1. The task's **fact sheet** (verified, human-authored)
2. The **task instructions**
3. A **prohibited topics list**: hidden tests, complete solutions

The prompt must instruct the model to:

- Only make claims supported by the fact sheet
- Respond with Socratic questions where possible
- Say "I don't know" rather than speculate
- Never reveal hidden test details

---

## Prompt Versioning

- Prompts live in `packages/ai/src/prompts/`
- Each prompt is versioned: `<name>-v<N>.ts`
- The active version is set via environment variable or config
- Prompt changes require a PR with changelog entry
- Old prompts are kept for audit purposes

---

## AI Call Logging

Every AI call must log to the `ai_calls` database table:

```typescript
{
  (model,
    prompt_name,
    prompt_version,
    input_tokens,
    output_tokens,
    latency_ms,
    cost_usd,
    attempt_id,
    purpose);
}
```

Logging is handled by `packages/ai/src/logger.ts` — every call goes through this.

---

## Fallback Behavior

| Failure                | Fallback                                                                       |
| ---------------------- | ------------------------------------------------------------------------------ |
| Mentor timeout         | Return authored fallback: "I'm unable to help right now. Try the hint ladder." |
| Viva follow-up failure | Skip to next authored question                                                 |
| Rubric grading failure | Return `{ status: 'ungraded', reason: 'ai_unavailable' }`                      |
| Weekly report failure  | Return `null` (API shows data-only summary)                                    |

**Never block the learner's core flow due to an AI failure.**

---

## Dependencies

| Package              | Usage                                    |
| -------------------- | ---------------------------------------- |
| `packages/contracts` | MentorRequestPayload, RubricResult types |
| `packages/database`  | Log AI calls to ai_calls table           |
| OpenAI API           | LLM calls                                |

---

## What This Package Must NOT Do

- Decide whether code is objectively correct
- Generate tasks live for learners
- Generate fake production logs or metrics
- Store learner email or name in prompts
- Access the learner's raw code submission (only structured answers go to AI)
- Retain full conversation history beyond the retention window
- Modify the database directly (only writes to `ai_calls` via the DB package)

---

## Security

- OpenAI API key stored in environment variable only
- Rate limiting on mentor endpoint enforced in `apps/api`
- Learner ID (UUID) used in logs — not name or email
- AI service runs with scoped service credentials

---

## Testing Requirements

- Unit tests for all AI functions with mocked OpenAI client.
- Test grounding logic (fact sheet injection).
- Test fallback behavior (timeout simulation).
- Test rubric grading result structure.
- Test AI call logging.
- Never call the real OpenAI API in unit tests.
