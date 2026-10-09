-- Migration: 20261009_000006_seed_catalog
-- Description: Seed initial authored knowledge catalog (reference systems, skills, templates, variants, misconceptions, rubrics)

-- 1. Reference Systems
INSERT INTO reference_systems (id, name, description, docker_image, version, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'shopverse',
  'Realistic Node.js/TypeScript e-commerce backend with PostgreSQL.',
  'eng-sim/shopverse:1.0.0',
  '1.0.0',
  'active'
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  docker_image = EXCLUDED.docker_image,
  version = EXCLUDED.version,
  status = EXCLUDED.status;

-- 2. Skills (12 foundational backend skills)
INSERT INTO skills (id, slug, name, description, track, status)
VALUES
  (
    '22222222-2222-2222-2222-222222220001',
    'db-query-design',
    'Database Query Design',
    'The ability to write correct, efficient SQL queries in the context of a production-like PostgreSQL schema.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220002',
    'db-concurrency',
    'Database Concurrency & Locking',
    'Managing transactions, isolation levels, row-level locks, and preventing race conditions or deadlocks.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220003',
    'api-error-handling',
    'API Error Handling & Resilience',
    'Designing robust error contracts, graceful exception boundaries, and meaningful status codes.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220004',
    'async-queue-processing',
    'Asynchronous Queue Processing',
    'Implementing background job pipelines, idempotency keys, and dead-letter queues.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220005',
    'auth-session-management',
    'Authentication & Session Management',
    'Secure token issuance, JWT verification, revocation strategies, and role-based access control.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220006',
    'cache-invalidation',
    'Caching Strategies & Invalidation',
    'Write-through, cache-aside, TTL policies, and atomic cache stampede prevention.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220007',
    'schema-migration-safety',
    'Zero-Downtime Schema Migrations',
    'Expand-contract patterns, backwards-compatible schema evolutions, and lock contention avoidance.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220008',
    'distributed-tracing',
    'Distributed Tracing & Observability',
    'Context propagation, structured logging, metric instrumentation, and SLI/SLO alerting.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220009',
    'rate-limiting',
    'Rate Limiting & Traffic Shaping',
    'Token bucket, sliding window rate limits, and DDoS protection for public APIs.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220010',
    'event-driven-architecture',
    'Event-Driven Architecture',
    'Publish-subscribe mechanisms, event sourcing primitives, and outbox patterns.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220011',
    'connection-pooling',
    'Connection Pool Sizing & Management',
    'Configuring client pools, transaction lifecycle boundaries, and leak detection.',
    'backend-node',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222220012',
    'idempotent-api-design',
    'Idempotent API Design',
    'Implementing IETF idempotency keys, replay defense, and safe retries in REST APIs.',
    'backend-node',
    'active'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  track = EXCLUDED.track,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 3. Skill Edges (Prerequisites and relationships)
INSERT INTO skill_edges (from_skill_id, to_skill_id, edge_type)
VALUES
  ('22222222-2222-2222-2222-222222220001', '22222222-2222-2222-2222-222222220002', 'prerequisite'),
  ('22222222-2222-2222-2222-222222220002', '22222222-2222-2222-2222-222222220011', 'prerequisite'),
  ('22222222-2222-2222-2222-222222220003', '22222222-2222-2222-2222-222222220004', 'prerequisite'),
  ('22222222-2222-2222-2222-222222220003', '22222222-2222-2222-2222-222222220012', 'prerequisite'),
  ('22222222-2222-2222-2222-222222220006', '22222222-2222-2222-2222-222222220009', 'related')
ON CONFLICT (from_skill_id, to_skill_id, edge_type) DO NOTHING;

-- 4. Rubrics
INSERT INTO rubrics (id, name, criteria)
VALUES
  (
    '44444444-4444-4444-4444-444444440001',
    'N+1 Query Resolution Rubric',
    '[
      {"id": "crit-n1-1", "criterion": "Identifies that individual queries are being executed inside a loop", "weight": 0.4},
      {"id": "crit-n1-2", "criterion": "Explains network and database round-trip performance degradation", "weight": 0.3},
      {"id": "crit-n1-3", "criterion": "Proposes relational JOIN or batched IN-clause lookup fix", "weight": 0.3}
    ]'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444440002',
    'Order Concurrency Defense Rubric',
    '[
      {"id": "crit-occ-1", "criterion": "Pinpoints check-then-act race window in inventory reservation", "weight": 0.4},
      {"id": "crit-occ-2", "criterion": "Implements explicit row-level locking (SELECT FOR UPDATE) or atomic updates", "weight": 0.4},
      {"id": "crit-occ-3", "criterion": "Verifies transaction rollback and isolation boundary semantics", "weight": 0.2}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Misconceptions Catalog
INSERT INTO misconceptions (id, slug, description, skill_id, status)
VALUES
  (
    '33333333-3333-3333-3333-333333330001',
    'joins-always-slower',
    'Belief that multiple individual indexed SELECTs are faster than a single relational JOIN.',
    '22222222-2222-2222-2222-222222220001',
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333330002',
    'read-uncommitted-safe',
    'Belief that wrapping queries in a basic BEGIN/COMMIT transaction prevents race conditions without row locking.',
    '22222222-2222-2222-2222-222222220002',
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333330003',
    'try-catch-everywhere',
    'Belief that wrapping every single line in individual try-catch blocks is superior to standardized error middleware.',
    '22222222-2222-2222-2222-222222220003',
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333330004',
    'fire-and-forget-safe',
    'Belief that background async promises without catch handlers do not risk process termination or memory leaks.',
    '22222222-2222-2222-2222-222222220004',
    'active'
  )
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  skill_id = EXCLUDED.skill_id,
  status = EXCLUDED.status;

-- 6. Task Templates
INSERT INTO task_templates (id, slug, name, description, skill_id, supporting_skill_ids, mode, difficulty_range, status)
VALUES
  (
    '55555555-5555-5555-5555-555555550001',
    'n-plus-one-detection',
    'Detect and Fix N+1 Query',
    'Learner must identify an N+1 query pattern in product category resolution, explain the latency overhead, and apply a batched join fix.',
    '22222222-2222-2222-2222-222222220001',
    '{}',
    'debug',
    int4range(1, 4),
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555550002',
    'order-concurrency-race',
    'Fix Order Inventory Race Condition',
    'Prevent overselling and negative stock under concurrent checkout requests by applying pessimistic locking or atomic checks.',
    '22222222-2222-2222-2222-222222220002',
    '{"22222222-2222-2222-2222-222222220001"}',
    'fix',
    int4range(2, 5),
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555550003',
    'error-contract-resilience',
    'Standardize API Error Contracts',
    'Replace unhandled asynchronous rejections and inconsistent payloads with centralized AppError handling middleware.',
    '22222222-2222-2222-2222-222222220003',
    '{}',
    'fix',
    int4range(1, 4),
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555550004',
    'dead-letter-retry',
    'Implement Queue Retries & Dead Letter Routing',
    'Build reliable asynchronous job processing with exponential backoff and dead-letter queue escalation.',
    '22222222-2222-2222-2222-222222220004',
    '{"22222222-2222-2222-2222-222222220003"}',
    'build',
    int4range(2, 6),
    'active'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  skill_id = EXCLUDED.skill_id,
  supporting_skill_ids = EXCLUDED.supporting_skill_ids,
  mode = EXCLUDED.mode,
  difficulty_range = EXCLUDED.difficulty_range,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 7. Variants
INSERT INTO variants (
  id,
  template_id,
  reference_system_id,
  version,
  title,
  narrative,
  instructions,
  fact_sheet,
  hint_ladder,
  explanation,
  misconception_ids,
  viva_question_ids,
  rubric_id,
  difficulty,
  estimated_minutes,
  status,
  published_at
)
VALUES
  (
    '66666666-6666-6666-6666-666666660001',
    '55555555-5555-5555-5555-555555550001',
    '11111111-1111-1111-1111-111111111111',
    1,
    'Shopverse: Products endpoint is slow',
    'A Datadog APM alert fired indicating GET /products p95 latency reached 2,400ms. Investigate and eliminate the N+1 query loop.',
    '1. Inspect src/routes/products.ts.\n2. Note how product categories are fetched in a loop.\n3. Replace loop queries with a single query using JOIN or batched WHERE IN.\n4. Verify tests pass.',
    '## Shopverse Products Architecture\n- Schema: products (id, name, price, category_id), categories (id, name).\n- The /products endpoint lists 50 items per page.\n- Current code executes 1 query for products + 50 queries for categories.',
    '[
      {"index": 1, "text": "Have you inspected the database query count during a single GET /products request?"},
      {"index": 2, "text": "Observe how each product item awaits a separate category lookup inside the map loop."},
      {"index": 3, "text": "Use an SQL JOIN or fetch all category IDs in a single batched query before mapping."}
    ]'::jsonb,
    'Classic N+1 query pattern where child relations are fetched iteratively rather than in a set-oriented relational query.',
    '{"33333333-3333-3333-3333-333333330001"}',
    '{"77777777-7777-7777-7777-777777770001", "77777777-7777-7777-7777-777777770002", "77777777-7777-7777-7777-777777770003", "77777777-7777-7777-7777-777777770004"}',
    '44444444-4444-4444-4444-444444440001',
    2,
    25,
    'published',
    NOW()
  ),
  (
    '66666666-6666-6666-6666-666666660002',
    '55555555-5555-5555-5555-555555550002',
    '11111111-1111-1111-1111-111111111111',
    1,
    'Shopverse: Concurrent order placement inventory race',
    'High concurrency during a flash sale caused products to sell below 0 stock. Protect the inventory decrement with row locking.',
    '1. Inspect src/services/orderService.ts.\n2. Notice how stock is checked in a SELECT and updated in a later UPDATE without locking.\n3. Add SELECT ... FOR UPDATE or an atomic decrement with stock >= quantity.\n4. Run the concurrency integration test.',
    '## Shopverse Order Processing\n- Products have a stock column.\n- Multiple simultaneous checkout requests can read the same stock value before either transaction commits.',
    '[
      {"index": 1, "text": "What happens if two concurrent requests read stock = 1 before either decrements?"},
      {"index": 2, "text": "Consider row-level locking with SELECT ... FOR UPDATE inside the transaction."},
      {"index": 3, "text": "Ensure both the read and update happen within the exact same transaction block."}
    ]'::jsonb,
    'Check-then-act race condition resolved through pessimistic row locking or conditional atomic updates.',
    '{"33333333-3333-3333-3333-333333330002"}',
    '{"77777777-7777-7777-7777-777777770005", "77777777-7777-7777-7777-777777770006", "77777777-7777-7777-7777-777777770007", "77777777-7777-7777-7777-777777770008"}',
    '44444444-4444-4444-4444-444444440002',
    3,
    30,
    'published',
    NOW()
  ),
  (
    '66666666-6666-6666-6666-666666660003',
    '55555555-5555-5555-5555-555555550003',
    '11111111-1111-1111-1111-111111111111',
    1,
    'Shopverse: Centralized error handling normalization',
    'Several endpoints return unformatted 500 error strings and leak stack traces in production. Standardize error handling.',
    '1. Create a structured AppError class with statusCode and errorCode.\n2. Implement Express 4-argument error middleware (err, req, res, next).\n3. Ensure JSON responses conform to the standard error envelope.',
    '## Shopverse API Standards\n- Error format must match: { error: { code: string, message: string, details?: any } }.\n- Status codes: 400 for bad input, 404 for missing items, 409 for conflicts, 500 for internal errors.',
    '[
      {"index": 1, "text": "Look at the arguments for the Express error middleware. It requires four parameters."},
      {"index": 2, "text": "Check if asynchronous errors are passed to next(err) or handled via Express 5 automatic promise rejection."},
      {"index": 3, "text": "Ensure no stack traces are included in the JSON payload when NODE_ENV is production."}
    ]'::jsonb,
    'Centralized error boundary middleware ensures consistent client API contracts and prevents internal data leakage.',
    '{"33333333-3333-3333-3333-333333330003"}',
    '{"77777777-7777-7777-7777-777777770009", "77777777-7777-7777-7777-777777770010", "77777777-7777-7777-7777-777777770011", "77777777-7777-7777-7777-777777770012"}',
    NULL,
    1,
    20,
    'published',
    NOW()
  ),
  (
    '66666666-6666-6666-6666-666666660004',
    '55555555-5555-5555-5555-555555550002',
    '11111111-1111-1111-1111-111111111111',
    2,
    'Shopverse: Transfer Task - High-Concurrency Flash Sale Protection',
    'Independent transfer challenge: A new high-throughput checkout route has been deployed. Prove your concurrency mastery with AI assistance disabled.',
    '1. Review the checkout service.\n2. Ensure inventory deductions are completely protected against race conditions.\n3. Note: Socratic mentor and hints are unavailable for this transfer task.',
    '## Transfer Task Fact Sheet\n- High concurrency simulated across 50 simultaneous parallel workers.\n- Stock must never drop below 0.\n- Successful checkout must match exact inventory limits.',
    '[
      {"index": 1, "text": "Hints are disabled during transfer tasks."},
      {"index": 2, "text": "Hints are disabled during transfer tasks."},
      {"index": 3, "text": "Hints are disabled during transfer tasks."}
    ]'::jsonb,
    'Transfer task evaluating independent mastery of database transaction isolation and pessimistic concurrency.',
    '{"33333333-3333-3333-3333-333333330002"}',
    '{"77777777-7777-7777-7777-777777770005", "77777777-7777-7777-7777-777777770006", "77777777-7777-7777-7777-777777770007", "77777777-7777-7777-7777-777777770008"}',
    '44444444-4444-4444-4444-444444440002',
    3,
    30,
    'published',
    NOW()
  )
ON CONFLICT (template_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  narrative = EXCLUDED.narrative,
  instructions = EXCLUDED.instructions,
  fact_sheet = EXCLUDED.fact_sheet,
  hint_ladder = EXCLUDED.hint_ladder,
  explanation = EXCLUDED.explanation,
  misconception_ids = EXCLUDED.misconception_ids,
  viva_question_ids = EXCLUDED.viva_question_ids,
  rubric_id = EXCLUDED.rubric_id,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at;
