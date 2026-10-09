# infrastructure/

**Owner:** Developer 2 (Backend / Infrastructure / Evaluation)
**Status:** structure only — nothing implemented yet

Docker, local development environment, CI/CD, deployment, monitoring, backups, and secrets.

---

## Scope

| Concern                                | Phase   | Note                                                      |
| -------------------------------------- | ------- | --------------------------------------------------------- |
| Docker + Compose for local development | Phase 1 | One command to bring up API, DB, worker, reference system |
| Reference-system container image       | Phase 1 | Built from `reference-systems/shopverse/`                 |
| Grading sandbox                        | Phase 1 | Isolated, resource-limited, no network by default         |
| CI/CD                                  | Phase 1 | Lint, type-check, unit tests, content validation          |
| Secrets management                     | Phase 1 | No secret in the repository, ever                         |
| Staging deployment                     | Phase 2 |                                                           |
| Redis + queue                          | Phase 2 | Simple queue only — see `PRODUCT_SPEC.md` §12             |
| Object storage                         | Phase 2 | Submissions and evaluation artifacts                      |
| Production deployment                  | Phase 3 | First college pilot                                       |
| Monitoring                             | Phase 3 | Queue depth, grading failure rate, API error rate         |
| Backups                                | Phase 3 | Verified by an actual restore, not by the job exiting 0   |
| Observability                          | Phase 5 | Real telemetry for production-debugging tasks             |

---

## Planned Layout

```
infrastructure/
├── README.md               (this file)
├── docker/                 # Dockerfiles for api, worker, web, reference system
├── compose/                # Local development compose files
├── grading/                # Grading sandbox definition and resource limits
├── ci/                     # CI pipeline definitions
└── deploy/                 # Deployment configuration (Phase 2+)
```

Nothing in this tree exists yet. Create a directory in the PR that needs it, and update this
README in the same PR.

---

## Rules

1. **Not Kubernetes.** Two developers, no scale problem. See `PRODUCT_SPEC.md` §16.
2. **Not multi-region.** No requirement exists.
3. **Grading containers are untrusted.** They run learner-submitted code: no network by
   default, hard CPU/memory/time limits, no host mounts beyond the task workspace, and the
   container is destroyed after every run.
4. **Hidden tests never enter a learner-reachable image or log.** This is an infrastructure
   constraint, not only an API one.
5. **No secrets in the repository.** Not in Compose files, not in CI config, not in examples.
   Use environment injection; document the required variables, never the values.
6. **Redis and Python are later.** Do not prepare infrastructure for them now
   (`PRODUCT_SPEC.md` §6).
7. **Local parity.** If it cannot be run locally by both developers with one command, it is not
   done.

---

## Related

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../EVALUATION_POLICY.md`](../EVALUATION_POLICY.md) — what the grading sandbox must guarantee
- [`../SECURITY.md`](../SECURITY.md)
- [`../OBSERVABILITY.md`](../OBSERVABILITY.md)
- [`../reference-systems/shopverse/README.md`](../reference-systems/shopverse/README.md)
- [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) §11 — deployment status
