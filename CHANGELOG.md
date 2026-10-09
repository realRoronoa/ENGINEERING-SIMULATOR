# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Rules**

1. Every release moves the contents of `[Unreleased]` under a new version heading with a date.
2. Release-related PRs update this file. Feature PRs update [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).
3. Empty subsections are kept so the shape of an entry is always obvious.
4. Version scope and release blockers live in [`RELEASE_PLAN.md`](./RELEASE_PLAN.md).

---

## [Unreleased]

### Added

- Initial TypeScript ESM monorepo foundation with npm workspaces (`apps/*`, `packages/*`)
- Minimal Fastify API shell (`apps/api`) with Zod-validated `/health` endpoint and Vitest suite
- **Frontend Complete Learner Journey (Demo Mode)**: End-to-end user experience encompassing Auth (Login, Signup), Onboarding, Dashboard, Missions, Evaluations, Viva, Transfer tasks, and Skill profiles.
- Shared contracts package (`packages/contracts`) exporting TypeScript interfaces (`Submission`, `EvaluationResult`, `EvaluationStatus`, `HealthResponse`, flags, disputes, weekly progress)
- Authored content catalog database seed migration (`20261009_000006_seed_catalog.sql`) defining 12 core backend skills, directed prerequisite graph, task templates, variants, rubrics, and misconceptions
- `@engineering-simulator/content` package providing content loaders, catalog exports, and variant validation against learning design standards
- Learner problem flags endpoint (`POST /v1/flags`) with attempt verification and ownership validation
- Evaluation dispute endpoint (`POST /v1/evaluations/:id/disputes`) with duplicate prevention and ownership enforcement
- Weekly progress reporting endpoint (`GET /v1/progress/weekly`) synthesizing activity, skill advancement, and transfer task metrics
- Unified root tooling: Vitest, ESLint (TypeScript flat config), Prettier (`.prettierrc.json`), `.editorconfig`, `.env.example`
- Root workspace scripts: `npm run build`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`

### Changed

- Updated single-developer project mode across documentation and workspace config
- Updated `tsconfig.base.json` for ESM `NodeNext` module resolution and strict type checking

### Changed

- Repository ownership restructured from a multi-developer model to **two developers**
- All package, app, and policy documents re-attributed to Developer 1, Developer 2, or Shared
- `README.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CONTRIBUTING.md` rewritten for a two-person team
- `.github/PULL_REQUEST_TEMPLATE.md` now requires a Project Status Impact section

### Fixed

- Removed stale references to Developers 3–10 across package READMEs, policies, and ADRs

### Removed

- Per-package developer ownership (packages are architectural modules, not teams)

### Security

- Nothing yet. Security and privacy review are release blockers for V1.0.

---

## [v0.0.1] — 2026-10-08

### Added

- Initial repository scaffold: monorepo layout, architecture documentation, ADRs, diagrams
- Product scope, AI policy, evaluation policy, security, privacy
- API, event, and database contracts
- Task lifecycle, content authoring guide, testing strategy, observability

### Changed

### Fixed

### Removed

### Security

---

<!--
Template for the next release — copy, do not edit this comment.

## [vX.Y.Z] — YYYY-MM-DD

### Added
### Changed
### Fixed
### Removed
### Security
-->
