# packages/selector — Task Selection Engine

**Owner:** Developer 7 (Selector / Adaptive Roadmap)
**Tech:** Node.js, TypeScript

---

## Purpose

Selects the next task for a learner based on their current skill state, the skill graph, active misconceptions, and session mode.

Returns a `SelectorDecision` — the chosen variant, difficulty, task mode, and human-readable reason.

---

## Responsibilities

- Read learner skill states from `packages/learner-model`
- Read the skill graph from `packages/content` (or DB via `packages/database`)
- Apply prerequisite filtering
- Rank skills by priority (low mastery + high goal relevance)
- Bias toward misconception-targeting tasks when active misconceptions exist
- Select task mode (debug, build, fix)
- Select difficulty targeting ~70% predicted success rate
- Select a suitable variant from the published pool
- Return a `SelectorDecision` with explanation
- Handle fallback gracefully when no ideal variant exists

---

## Structure

```
packages/selector/src/
├── index.ts                   # Public exports: select()
├── selector.ts                # Main entry — orchestrates selection
├── filters/
│   ├── prerequisites.ts       # Remove skills without satisfied prerequisites
│   └── recency.ts             # Remove recently seen variants
├── rankers/
│   ├── mastery.ts             # Rank by mastery deficit
│   └── relevance.ts           # Rank by goal relevance
├── strategies/
│   ├── mode.ts                # Select task mode
│   ├── difficulty.ts          # Select difficulty (target 70% success)
│   └── variant.ts             # Select variant from pool
├── fallback.ts                # Fallback behavior when no ideal variant
└── types.ts                   # Internal selector types
```

---

## Public API

```typescript
// TODO: implement in packages/selector/src/index.ts

export async function selectNextTask(input: SelectorInput): Promise<SelectorDecision>;

// SelectorInput and SelectorDecision defined in packages/contracts/src/selector/decision.ts
```

---

## Initial Selection Algorithm

```
1. Load learner skill states (from packages/learner-model or DB)
2. Load skill graph (all active skills + edges)
3. Filter: remove skills whose prerequisites are not satisfied
4. Filter: remove skills with status !== 'active'
5. Rank remaining skills:
   a. Low mastery → higher priority
   b. High goal relevance → higher priority
6. Check for active misconceptions → boost misconception-targeting variants
7. Select target skill (top-ranked after scoring)
8. Select task mode (based on skill + recent attempt history)
9. Select difficulty:
   a. Estimate learner's success probability at each difficulty level
   b. Choose difficulty closest to 70% predicted success rate
10. Find published variants matching (skill, mode, difficulty ± 1)
11. Filter out recently seen variants (last 5 attempts)
12. Select variant (weighted random from suitable pool)
13. If no suitable variant: trigger fallback
14. Return SelectorDecision
```

---

## Fallback Behavior

If no suitable variant is found after all filters:
1. Log warning with learner ID, skill, mode
2. Relax constraints: broaden difficulty range, allow recently seen
3. If still no match: return any published variant for the skill
4. Set `fallback: true` in the decision
5. Alert content team via log [Phase 3: ops dashboard]

---

## The "Learning Path" Rule

> The learning path is NOT stored as a static roadmap.

It is derived fresh at each selection by reading the learner's current state. There is no pre-planned sequence. The selector makes a new decision every time a task is needed.

---

## Dependencies

| Package | Usage |
|---|---|
| `packages/database` | Read skill states, variants, item_stats |
| `packages/contracts` | SelectorInput, SelectorDecision types |

Note: The selector reads mastery state from the database (written by `packages/learner-model`). It does NOT import from `packages/learner-model` directly — it reads the DB.

---

## What This Package Must NOT Do

- Implement machine learning [FUTURE — Phase 4]
- Store a pre-planned learning path
- Modify learner state
- Modify content (read-only)
- Generate tasks
- Call AI APIs

---

## Testing Requirements

- Unit tests for all selection logic (filters, rankers, strategies).
- Test with mock learner states covering: new learner, high-mastery learner, learner with misconceptions.
- Test fallback behavior when no variants are available.
- Test prerequisite filtering (learner with unsatisfied prerequisites).
- Deterministic tests — same input always produces same output for unit tests.
