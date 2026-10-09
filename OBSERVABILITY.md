# Observability

**Owner:** Developer 10 (Infrastructure)
**Status:** Basic logging in MVP. Full observability in Phase 3.

---

## MVP Observability

### Structured Logging

All applications log in JSON format using `pino` (or equivalent).

Required log fields:

```json
{
  "level": "info",
  "time": "iso8601",
  "service": "api | worker | cli",
  "requestId": "uuid | null",
  "learnerId": "uuid | null",
  "attemptId": "uuid | null",
  "msg": "string",
  "durationMs": 0
}
```

**Key rule:** Never log PII (email, name) in server logs. Use opaque IDs only.

---

### Key Events to Log

| Service | Event | Level |
|---|---|---|
| API | Request received | `info` |
| API | Request completed | `info` |
| API | Validation error | `warn` |
| API | Auth failure | `warn` |
| API | 500 error | `error` |
| Worker | Grading job started | `info` |
| Worker | Docker container started | `info` |
| Worker | Tests completed | `info` |
| Worker | Grading job failed | `error` |
| Worker | Container timeout | `warn` |
| AI | AI call started | `info` |
| AI | AI call completed (tokens, cost) | `info` |
| AI | AI call failed | `error` |
| AI | Fallback triggered | `warn` |

---

### What Must NOT Be Logged

- Raw learner code submissions
- Mentor conversation content (use `ai_calls` DB table)
- Learner email or name
- Device tokens or JWT tokens
- Environment variables or secrets

---

## Metrics (MVP)

Track in application code and expose to infrastructure:

| Metric | Type | Labels |
|---|---|---|
| `api_request_duration_ms` | Histogram | `route`, `method`, `status` |
| `grading_job_duration_ms` | Histogram | `variant_id`, `status` |
| `grading_job_count` | Counter | `status` |
| `ai_call_cost_usd` | Counter | `purpose`, `model` |
| `ai_call_latency_ms` | Histogram | `purpose` |
| `hint_requests_count` | Counter | |
| `submission_count` | Counter | `status` |

---

## Error Tracking

MVP: Log errors to stdout with full stack trace.

Phase 3: Integrate Sentry (or equivalent) for error grouping and alerting.

---

## Health Endpoints

Every service must expose:

```
GET /health
→ 200 { "status": "ok", "timestamp": "iso8601" }

GET /health/ready
→ 200 { "status": "ready" } | 503 { "status": "not_ready", "reason": "..." }
```

---

## Future Observability [PHASE 3]

- [ ] Distributed tracing (OpenTelemetry)
- [ ] Centralized log aggregation (Loki / CloudWatch)
- [ ] Metrics dashboard (Grafana)
- [ ] Alerting (PagerDuty or equivalent)
- [ ] AI quality monitoring (response latency P99, fallback rate)
- [ ] Content health dashboard (variant pass rates, flag rates)
- [ ] Learner progress anomaly detection

---

## Principle

> Logs and metrics must come from running code.
> Do not generate fake production data using an LLM.
