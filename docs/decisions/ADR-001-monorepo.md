# ADR-001: Monorepo Structure

**Status:** Accepted
**Date:** 2024-01
**Authors:** Architecture Team

---

## Context

We need to decide how to structure the codebase for a system with multiple deployable applications (web, API, worker, CLI) and multiple shared packages (evaluator, selector, learner-model, ai, content, database, contracts).

Options considered:

1. **Monorepo** — all code in one repository, managed with pnpm workspaces
2. **Polyrepo** — each service in its own repository
3. **Hybrid** — apps separate, shared packages in a library repo

---

## Decision

We will use a **monorepo** with pnpm workspaces.

---

## Rationale

1. **Contract enforcement:** The `packages/contracts/` package is the shared type layer. In a monorepo, TypeScript's project references catch contract violations at compile time across all packages. In a polyrepo, this requires publishing and versioning.

2. **Small team:** With 10 developers, coordinating across multiple repositories adds overhead. A monorepo lets developers see the full system.

3. **Atomic changes:** A single PR can update a contract type AND update all consumers. This is essential for the "change contract first" rule.

4. **Content colocation:** Content files (variants, skills, rubrics) live alongside the code that validates and imports them.

5. **Simplified CI:** One CI configuration covers all packages. Contract changes can immediately test all affected consumers.

---

## Consequences

- All developers work in the same repository. Branch naming and ownership conventions are critical (see `CONTRIBUTING.md`).
- `packages/contracts/` becomes a dependency of every other package — it must stay minimal and stable.
- pnpm workspace scripts allow running per-package commands without leaving the root.
- A future polyrepo split is possible if the team grows significantly (extract individual services).

---

## What This Decision Does NOT Mean

- This does not mean all packages are deployed together.
- `apps/api`, `apps/worker`, `apps/web`, and `apps/cli` are still separately deployable.
- The monorepo is a **development structure**, not a deployment structure.
