# packages/content — Content Engine

**Owner:** Developer 4 (Content / Learning Design)
**Tech:** YAML/JSON files + TypeScript validation + import scripts

---

## Purpose

Stores and validates all authored content: skills, task templates, variants, fault patterns, rubrics, misconceptions, viva question banks, and hint ladders.

This package is the source of truth for all learner-facing content.

---

## Responsibilities

- Skill graph (12 initial skills + prerequisites)
- Task templates (15 initial templates)
- Validated variants (~60 for MVP)
- Fault patterns catalog
- Rubrics
- Misconception catalog
- Viva question banks
- Hint ladders
- Reference system metadata
- Content validation scripts
- Content import scripts (populate database from files)

---

## Structure

```
packages/content/
├── README.md
├── package.json
├── skills/
│   ├── _index.yaml             # Skill list + graph
│   ├── db-query-design.yaml
│   ├── api-error-handling.yaml
│   ├── n-plus-one.yaml
│   └── ...                     # 12 skills total (Phase 2)
├── templates/
│   ├── _index.yaml
│   ├── n-plus-one-detection.yaml
│   └── ...                     # 15 templates (Phase 2)
├── variants/
│   ├── shopverse/
│   │   ├── var-001-products-slow.yaml
│   │   └── ...                 # ~60 validated variants (Phase 2)
│   └── _index.yaml
├── fault-patterns/
│   ├── n-plus-one.yaml
│   └── ...
├── rubrics/
│   ├── rubric-n-plus-one-explanation.yaml
│   └── ...
├── reference-systems/
│   └── shopverse.yaml          # Metadata only — actual code in reference-systems/shopverse/
└── src/
    ├── index.ts               # Public exports: loadSkills(), loadVariants(), etc.
    ├── loaders/
    │   ├── skills.ts
    │   ├── templates.ts
    │   ├── variants.ts
    │   └── rubrics.ts
    ├── validators/
    │   ├── variant.ts         # Full variant validation
    │   ├── skills.ts
    │   └── rubric.ts
    └── scripts/
        ├── validate.ts        # Run all content validation
        └── import.ts          # Import content into database
```

---

## Content Lifecycle

```
Draft → Generate (AI-assisted, offline) → Validate → Review → Publish → Active → Paused → Retired
```

**No learner sees content in Draft, Generate, Validate, or Review status.**

---

## Validation Rules (per variant)

A variant must pass ALL of these before `review` status:

1. ✅ Reference fix applies cleanly to Docker reference system
2. ✅ All hidden tests pass with the fix applied
3. ✅ All hidden tests fail without the fix
4. ✅ Hint ladder has 3–5 hints
5. ✅ Fact sheet is verified against actual reference code
6. ✅ Viva questions are complete (minimum 4)
7. ✅ Rubric covers at least 3 criteria (if rubric-graded)
8. ✅ Estimated minutes is set
9. ✅ Difficulty is set (1–5)
10. ✅ Title and narrative are present and non-trivial
11. ✅ Misconception IDs reference valid entries in misconception catalog

---

## Public API

```typescript
// TODO: implement in packages/content/src/index.ts

export function loadSkills(): Promise<Skill[]>;
export function loadSkillGraph(): Promise<SkillEdge[]>;
export function loadTemplates(): Promise<TaskTemplate[]>;
export function loadVariants(filters?: { skillId?: string; status?: string }): Promise<Variant[]>;
export function loadVariantById(id: string): Promise<Variant | null>;
export function loadRubricById(id: string): Promise<Rubric | null>;
export function loadMisconceptions(): Promise<Misconception[]>;
```

---

## MVP Content Plan

| Content Type | MVP Count | Phase 1 Count | Status |
|---|---|---|---|
| Skills | 12 | 3 | [ ] |
| TaskTemplates | 15 | 3 | [ ] |
| Variants | ~60 | 3 | [ ] |
| FaultPatterns | ~20 | 3 | [ ] |
| Rubrics | ~15 | 3 | [ ] |
| VivaQuestionBanks | ~15 | 3 | [ ] |
| Misconceptions | ~30 | 0 | [ ] |

---

## Dependencies

| Package | Usage |
|---|---|
| `packages/database` | Import scripts write to DB |
| `reference-systems/shopverse` | Validation scripts run against Shopverse Docker |

This package does NOT depend on `packages/contracts` for its file-level types.
It defines its own YAML schemas and TypeScript loader types.

---

## What This Developer Must NOT Implement

- API route handlers
- Grading logic
- Mastery calculations
- Selector logic
- Any AI calls (offline drafting is tooling, not runtime code)
- Frontend code
- Python track content [FUTURE — Phase 6]
- Incident content [FUTURE — Phase 5]

---

## Testing Requirements

- Content validation scripts run in CI on every PR that touches `packages/content/`.
- Validation must run against a real Docker reference system.
- All 3 Phase 1 variants must pass full validation before merge.
- Content import script must be idempotent.
