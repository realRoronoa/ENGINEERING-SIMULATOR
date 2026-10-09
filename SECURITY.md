# Security Policy

## Scope

This document defines the security model for Engineering Simulator.

---

## Authentication Model

| Actor | Method | Notes |
|---|---|---|
| Learner (web) | Supabase JWT | Issued on login. Attached as `Authorization: Bearer <token>`. |
| Learner (CLI) | Device token | Scoped to the learner. Generated on `engsim login`. Stored in local config only. |
| Admin | JWT + admin role | [FUTURE] RLS enforced at DB level. |
| Grading worker | Internal service token | Never exposed to learners. Rotated periodically. |
| AI service | OpenAI API key | Environment variable only. Never committed. |

---

## Authorization Boundaries

### Learner

A learner may only access:

- Their own `attempts`
- Their own `submissions`
- Their own `evaluations`
- Their own `evidence_events`
- Their own `skill_states`
- Their own `sessions`
- Their own `hint_events`
- Their own `viva_records`

A learner may **not** access:

- Hidden tests
- Other learners' data
- Content authoring endpoints
- Admin endpoints
- Worker endpoints
- Internal service tokens

Row-level security (RLS) is enforced in PostgreSQL via Supabase policies.

### Worker

- Reads grading jobs from queue
- Reads variant data (read-only)
- Writes evaluation results
- Writes evidence events
- Cannot access learner profile data beyond the attempt ID

### Admin [FUTURE]

- Read access to all learner data (aggregated)
- Write access to content status (approve, pause, retire)
- No access to raw learner keystroke or terminal data

---

## Transport Security

- All API endpoints must be served over HTTPS in production.
- CLI device token is transmitted over HTTPS only.
- No secrets transmitted in query parameters.
- All cookies set with `HttpOnly`, `Secure`, `SameSite=Strict`.

---

## Secret Management

- Secrets stored in environment variables only.
- `.env` files never committed to repository.
- `.env.example` committed with placeholder values.
- Production secrets managed via infrastructure secrets manager [FUTURE — Phase 3].

---

## Grading Isolation

- Learner-submitted code runs in isolated Docker containers.
- Containers are network-restricted during execution.
- Containers cannot access the host filesystem beyond the task directory.
- Containers are destroyed after each grading job.

---

## CLI Security

The CLI:

- Stores device token in local config directory only
- Accesses only the task folder (`~/.engsim/tasks/<task-id>/`)
- Does NOT collect raw keystrokes
- Does NOT transmit terminal history
- Does NOT read unrelated machine files
- Does NOT store or transmit learner secrets (passwords, SSH keys, etc.)

See `PRIVACY.md` for full data collection policy.

---

## Dependency Security

- All dependencies pinned to exact versions in production builds.
- `pnpm audit` runs in CI on every PR.
- No unreviewed indirect dependencies.

---

## Incident Response [FUTURE — Phase 3]

- Security incidents reported to security contact (defined at project setup).
- Compromised tokens are revocable from admin panel.
- Automated alerting on anomalous grading job behavior.

---

## Reporting Vulnerabilities

If you discover a security vulnerability, do NOT open a public GitHub issue.

Contact the security team directly (contact details to be added at project setup).

---

## What Is Intentionally NOT Stored

See `PRIVACY.md` for the complete list of data the system does not collect.
