# docs/product/

**Owner:** Developer 1 (Product / Frontend / Learning Experience)

Product research and learning-design notes. This is where the **evidence** behind product
decisions lives — the raw material that `PRODUCT_SPEC.md` is distilled from.

> `PRODUCT_SPEC.md` holds conclusions. This directory holds the findings those conclusions came
> from. If a product claim cannot be traced to something here, it is an assumption, and should
> be labelled as one.

---

## What belongs here

| Content | When |
|---|---|
| Student interview notes and findings | Phase 0 |
| Faculty interview notes | Phase 0 |
| Hiring manager interview notes | Phase 0 |
| Manual mission designs and run write-ups | Phase 0 |
| Practice vs transfer observations | Phase 0 onward |
| Skill graph design notes and rationale | Phase 0–2 |
| Task template design notes | Phase 1–2 |
| Misconception research | Phase 2 onward |
| Learner session observations | Phase 1 onward |
| Diagnostic design rationale | Phase 2 |
| Weekly report design notes | Phase 2 |

## What does not belong here

- Product conclusions → `PRODUCT_SPEC.md`
- Progress and status → `PROJECT_STATUS.md`
- Architecture decisions → `docs/decisions/`
- Authored content artifacts (skills, templates, variants) → `packages/content/`
- Anything that identifies an interviewee — see below

---

## Suggested layout

```
docs/product/
├── README.md                     (this file)
├── research/
│   ├── students/                 # Interview findings, anonymized
│   ├── faculty/
│   └── hiring/
├── missions/                     # Manual mission designs and run write-ups
├── learning-design/              # Skill graph, templates, misconceptions, diagnostic
└── observations/                 # Learner session notes, transfer observations
```

Create a subdirectory when you have something to put in it, not before.

---

## Privacy rule for research notes

Interview and session notes describe real people.

- **No names, emails, phone numbers, college identifiers, or anything else that identifies an
  individual.** Use a stable pseudonym (`S-01`, `F-02`) and keep the mapping outside the
  repository.
- Record what was observed, not who said it.
- Quote only what is needed to support the finding.

This repository is for engineering artifacts. Personal data does not belong in version control.
See [`../../PRIVACY.md`](../../PRIVACY.md).

---

## Writing a finding

Keep each finding short and falsifiable:

```markdown
## Finding: <one sentence>

**Evidence:** what was observed, and from how many people/sessions
**Confidence:** high | medium | low
**Product implication:** what this changes in PRODUCT_SPEC.md, if anything
**Date:** YYYY-MM-DD
```

A finding with no product implication is still worth recording — it stops the same question
being re-asked later.

---

## Related

- [`../../PRODUCT_SPEC.md`](../../PRODUCT_SPEC.md) — the conclusions
- [`../../PRODUCT_SCOPE.md`](../../PRODUCT_SCOPE.md) — product principles
- [`../../ROADMAP.md`](../../ROADMAP.md) — Phase 0 deliverables
- [`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md) — Phase 0 milestone checklist
- [`../../CONTENT_AUTHORING.md`](../../CONTENT_AUTHORING.md) — turning design into content
