# System Context Diagram

```mermaid
graph TD
    Learner["👤 Learner"]
    WebApp["Web App\n(Next.js)"]
    CLI["CLI Tool\n(engsim)"]
    API["API Server\n(Node.js)"]
    DB[("PostgreSQL")]
    Queue["Job Queue\n(pg-boss)"]
    Worker["Grading Worker\n(Node.js + Docker)"]
    Docker["Docker\n(Isolated Container)"]
    AI["AI Service\n(OpenAI API)"]
    Selector["Selector\n(package)"]
    LearnerModel["Learner Model\n(package)"]
    Content["Content Engine\n(package)"]
    Evaluator["Evaluator\n(package)"]

    Learner -->|"Uses"| WebApp
    Learner -->|"Uses"| CLI

    WebApp -->|"REST API calls"| API
    CLI -->|"REST API calls"| API

    API -->|"Read/Write"| DB
    API -->|"Calls"| Selector
    API -->|"Calls"| LearnerModel
    API -->|"Reads"| Content
    API -->|"Calls"| AI
    API -->|"Enqueues grading jobs"| Queue

    Selector -->|"Reads mastery"| LearnerModel
    Selector -->|"Reads skill graph"| Content
    Selector -->|"Reads"| DB

    LearnerModel -->|"Reads/writes"| DB

    Queue -->|"Dispatches jobs"| Worker
    Worker -->|"Uses"| Docker
    Worker -->|"Uses"| Evaluator
    Worker -->|"Reads variants"| Content
    Worker -->|"Writes evaluations"| DB
    Worker -->|"Emits evidence"| DB

    AI -->|"Reads fact sheets"| Content
    AI -->|"Logs calls"| DB
```

---

## Key Boundaries

| Boundary        | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| Learner ↔ API   | All learner actions go through the API. No direct DB access.                     |
| API ↔ Worker    | Async via queue. API returns 202; worker processes independently.                |
| Worker ↔ Docker | Each grading job runs in an isolated container. No shared state.                 |
| Packages ↔ DB   | Packages (selector, learner-model) access DB via `packages/database` layer only. |
| API ↔ AI        | AI calls are logged. AI never writes directly to core tables.                    |

---

## What Is NOT In This Diagram (Future)

- Redis (Phase 2+)
- Hosted sandbox fleet (Phase 5)
- Multi-region CDN (Phase 6)
- Kubernetes orchestration (Phase 5)
- Professor dashboard (Phase 3)
