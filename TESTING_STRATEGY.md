# Testing Strategy

**Owner:** All developers (each owns tests for their module)

---

## Philosophy

- **Deterministic tests are authoritative.** Tests judge correctness; AI does not.
- **Tests live near the code they test.**
- **No fake data.** Seed real data. Run real queries. Execute real containers.
- **Test the contract, not the implementation.** Integration tests verify API contracts; unit tests verify engine logic.

---

## Test Layers

| Layer | Type | Tool | Owner |
|---|---|---|---|
| Contracts | Type checking | TypeScript compiler | All |
| Engines (evaluator, selector, learner-model) | Unit | Vitest | Dev 5, 7, 6 |
| API endpoints | Integration (real DB) | Supertest + Vitest | Dev 2 |
| Database | Migration + query tests | Vitest + pg | Dev 3 |
| Content | Validation scripts | Custom scripts | Dev 4 |
| Worker | Integration (Docker) | Vitest | Dev 5 |
| Web | Component tests | Vitest + Testing Library | Dev 1 |
| CLI | E2E | Vitest | Dev 9 |
| AI | Unit (mocked LLM) | Vitest | Dev 8 |

---

## Unit Tests

### evaluator, selector, learner-model

- All public functions must have unit tests.
- Use deterministic inputs; never call real Docker or LLM.
- Focus on correctness of the algorithm, not infrastructure.
- Minimum 80% line coverage required.

```
packages/evaluator/src/
  grader.ts
  grader.test.ts       ← unit tests here
```

---

## Integration Tests

### API

- Use a real PostgreSQL database (test schema).
- Use a real Supabase JWT (test user).
- Seed test data before each test suite.
- Clean up after each test suite.
- Test all status codes (200, 201, 202, 400, 403, 404, 409, 503).

### Worker

- Use real Docker (requires Docker running in CI).
- Use real reference system Docker image.
- Test the full grading job lifecycle for 1–2 real variants.
- Test timeout and failure paths with a poisoned patch.

---

## Content Validation

Developer 4 runs validation scripts before any content is published:

```bash
pnpm --filter @eng-sim/content validate
```

Validation checks:
- Fix applies cleanly to Docker reference system
- Hidden tests pass with fix
- Hidden tests fail without fix
- Hint ladder completeness
- Viva question completeness
- Rubric completeness

---

## CI Requirements

Every PR to `develop` or `main` must pass:

1. `pnpm type-check` — all TypeScript types pass
2. `pnpm lint` — no lint errors
3. `pnpm test` — all unit + integration tests pass (excluding Docker tests on fast CI)
4. Content validation (if content files changed)

Docker-based tests run on a separate CI job (slower, runs on merge to `develop`).

---

## Test Data

- No fake AI-generated data in tests.
- Seed files in `packages/database/src/seed/`.
- Test variants are minimal but valid.
- Test users use deterministic UUIDs.

---

## What NOT to Test with AI

- Code correctness (use real tests)
- Query performance (use real benchmarks)
- System behavior (run the actual code)

---

## Future [PHASE 3]

- Property-based tests for mastery model
- Load tests for API endpoints
- Chaos tests for worker retry logic
- Automated content regression tests (verify no published variant breaks after reference system update)
