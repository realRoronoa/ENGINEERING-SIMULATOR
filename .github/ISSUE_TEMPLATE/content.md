---
name: Content Addition
about: Propose new skills, templates, variants, fault patterns, or rubrics
title: 'content: '
labels: 'type:content, area:content'
assignees: ''
---

> Content is owned by **Developer 1**. Hidden tests and the grading mapping are implemented by
> **Developer 2** from the expected behaviour defined here.

## Content type

- [ ] Skill
- [ ] Skill graph change
- [ ] Task template
- [ ] Variant
- [ ] Fault pattern
- [ ] Hint ladder
- [ ] Rubric
- [ ] Misconception
- [ ] Viva questions
- [ ] Transfer task

## Target skill

<!-- Which of the 12 skills does this belong to? -->

## Description

<!-- What is the task, and what engineering capability does it exercise? -->

## Expected behaviour

<!-- Required for anything gradeable. This is what Dev 2 turns into hidden tests. -->

**Before the fix:**

**After the fix:**

## Fault injection point

<!-- Where in the reference system the fault lives. Needs Dev 2 if a new injection point is required. -->

## Misconceptions targeted

<!-- Which faulty mental models this is designed to surface. -->

## Viva questions

1.
2.
3.
4.

## Validation checklist

- [ ] Fix applies cleanly to the Docker reference system
- [ ] Hidden tests **fail without** the fix
- [ ] Hidden tests **pass with** the fix
- [ ] Hint ladder is complete
- [ ] Rubric defined for any free-text reasoning
- [ ] No hidden test content is reachable from a learner-facing surface

## Project status impact

<!-- New counts for PROJECT_STATUS.md §1 (Content %) and CURRENT_STATE.md. -->
