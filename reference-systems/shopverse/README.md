# Shopverse — Reference System

**Owner:** Developer 4 (Content) / Developer 10 (Infrastructure)
**Tech:** Node.js, TypeScript, PostgreSQL (MVP)

---

## Purpose

Shopverse is the primary reference system (codebase) used for all MVP backend tasks.
It is a realistic, intentionally flawed e-commerce backend.

Learners are given tasks (variants) that require them to find and fix bugs, improve performance, or implement new features within this codebase.

---

## Architecture

- **App:** Node.js + Express / Hono (TypeScript)
- **Database:** PostgreSQL
- **ORM/Query Builder:** Kysely or pure pg
- **Phase 1-2:** Monolithic API + DB
- **Phase 5 (FUTURE):** Adds Redis, background workers, payment mock, and observability tools

---

## Modules

| Module | Description |
|---|---|
| `api/` | Express/Hono route handlers |
| `services/` | Business logic (orders, products, users) |
| `db/` | Database access and queries |
| `tests/` | Internal test suite (not learner hidden tests) |
| `docker/` | Dockerfile and compose for local execution |
| `seed/` | Database seed scripts (generates realistic data volume) |

---

## APIs (Simulated)

- `GET /products` — Product listing, search, filtering
- `POST /cart` — Add to cart
- `POST /checkout` — Place order
- `GET /orders/:id` — Order status
- `POST /users/register` — Auth

---

## Developer Experience

The reference system must be easy for learners to run locally:

```bash
cd reference-systems/shopverse
docker compose up -d
pnpm install
pnpm dev
```

---

## Known Fault Injection Points

Content authors (Developer 4) design tasks by injecting faults into this codebase.
Common injection points for MVP:
- `api/products.ts` — N+1 queries in category fetching
- `services/orders.ts` — Missing transactions during checkout
- `db/schema.sql` — Missing indexes on heavily queried columns
- `api/checkout.ts` — Race conditions in inventory deduction
- `services/auth.ts` — Insecure password comparison or session handling

---

## Testing Requirements

This system is tested two ways:
1. **Internal tests:** The system's own unit/integration tests (`tests/`).
2. **Variant validation:** Developer 4 runs content validation scripts against this system to ensure injected faults behave as expected and hidden tests can catch them.

---

## Security

- This codebase is explicitly vulnerable by design (depending on the injected fault).
- It runs inside an isolated Docker container during grading.
- Do NOT deploy this system to the public internet as a live service.

---

## What This Must NOT Do

- No frontend/UI (it's a backend API only).
- No production deployment configs (it's a reference target, not our real product).
- Do not build the Phase 5 architecture (Redis/Queue) during MVP.
