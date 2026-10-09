# packages/learner-model — Mastery Engine

**Owner:** Developer 6 (Learner Model / Personalization)
**Tech:** Node.js, TypeScript

---

## Purpose

Maintains and updates the learner's skill mastery model.

Reads evidence events (from evaluations and viva) and updates `skill_states` using a simple, explainable mastery model.

---

## Responsibilities

- Process evidence events and update skill mastery
- Maintain the evidence ledger
- Track and record misconceptions
- Provide mastery state to the Selector and API
- Process diagnostic results as a special evidence type
- Weight transfer evidence higher than practice evidence
- Weight diagnostic evidence differently from practice evidence

---

## Structure

```
packages/learner-model/src/
├── index.ts                   # Public exports
├── mastery/
│   ├── model.ts               # Core mastery calculation (Beta model)
│   ├── updater.ts             # Update skill_state given an evidence event
│   └── evidence-weights.ts    # Evidence type weights
├── evidence/
│   └── processor.ts           # Process EvidenceEvent, trigger mastery update
├── misconceptions/
│   └── tracker.ts             # Record misconception hits, read active misconceptions
├── diagnostic/
│   └── processor.ts           # Process diagnostic session results as evidence
└── types.ts                   # Internal learner-model types
```

---

## Public API

```typescript
// TODO: implement

// Process a new evidence event and update skill_state
export async function processEvidence(event: EvidenceEventPayload): Promise<void>;

// Get current skill state for a learner
export async function getSkillState(learnerId: string, skillId: string): Promise<SkillStatePayload>;

// Get all skill states for a learner
export async function getAllSkillStates(learnerId: string): Promise<SkillStatePayload[]>;

// Record a misconception hit
export async function recordMisconception(
  learnerId: string,
  misconceptionId: string,
  attemptId: string,
  source: string
): Promise<void>;
```

---

## Mastery Model (MVP)

**Model type:** Beta distribution mastery model (simple, explainable).

Each skill state stores `alpha` and `beta` parameters of a Beta distribution.

```
mastery estimate = alpha / (alpha + beta)
```

### Evidence Update Rules

| Evidence Type       | Weight | Notes                                                             |
| ------------------- | ------ | ----------------------------------------------------------------- |
| `practice` (pass)   | 1.0    | Standard evidence                                                 |
| `practice` (fail)   | 0.5    | Failure is evidence too, but weighted less                        |
| `transfer` (pass)   | 2.0    | Transfer evidence is weighted higher — indicates genuine learning |
| `transfer` (fail)   | 0.5    |                                                                   |
| `diagnostic` (pass) | 0.3    | Low weight — diagnostic is uncertain baseline                     |
| `diagnostic` (fail) | 0.2    |                                                                   |

Difficulty modifies weight:

- Higher difficulty success → slightly higher weight
- Lower difficulty success → slightly lower weight

### Alpha/Beta Update

On each evidence event:

```
if passed:
  alpha = alpha + weight * difficulty_modifier
else:
  beta = beta + weight * difficulty_modifier

mastery = alpha / (alpha + beta)
```

Initial state for all learners: `alpha = 1, beta = 3` (prior: 25% mastery).
After diagnostic: adjusted based on diagnostic answers.

---

## How Diagnostic Evidence Works

The diagnostic provides the initial prior. Each diagnostic question answered correctly moves `alpha` up; incorrect moves `beta` up. Weight is low (0.3/0.2) because diagnostic answers are uncertain (no graded execution).

---

## How Misconception Tracking Works

1. Misconceptions are detected from:
   - Structured answer evaluation (incorrect answer maps to a known misconception)
   - Viva answer rubric results (reasoning gap maps to misconception)
   - [Phase 2] AI misconception classifier on free-text

2. `misconception_hits` records are created with `source` field.
3. The selector reads active misconceptions (from last 30 days) to bias selection.
4. A misconception is "resolved" when evidence shows the learner answered the related question correctly.

---

## What This Package Must NOT Do

- Implement machine learning [FUTURE — Phase 4]
- Implement spaced review scheduling [FUTURE — Phase 4]
- Generate tasks
- Call AI APIs directly
- Access attempt data beyond what evidence events provide
- Implement the selector logic

---

## Dependencies

| Package              | Usage                                                        |
| -------------------- | ------------------------------------------------------------ |
| `packages/database`  | Read/write skill_states, evidence_events, misconception_hits |
| `packages/contracts` | EvidenceEventPayload, SkillStatePayload                      |

---

## Testing Requirements

- Unit tests for mastery calculation with deterministic inputs.
- Test each evidence type and weight combination.
- Test the Beta model update math with known inputs and expected outputs.
- Test misconception recording and resolution.
- Test diagnostic processing.
- No integration with real database in unit tests (mock DB functions).
