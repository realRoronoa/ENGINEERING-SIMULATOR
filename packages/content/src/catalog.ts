import type {
  ReferenceSystem,
  Skill,
  SkillEdge,
  TaskTemplate,
  Variant,
  Rubric,
  Misconception,
  FaultPattern,
} from './types.js';

export const REFERENCE_SYSTEMS: ReferenceSystem[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'shopverse',
    description: 'Realistic Node.js/TypeScript e-commerce backend with PostgreSQL.',
    dockerImage: 'eng-sim/shopverse:1.0.0',
    version: '1.0.0',
    status: 'active',
  },
];

export const SKILLS: Skill[] = [
  {
    id: '22222222-2222-2222-2222-222222220001',
    slug: 'db-query-design',
    name: 'Database Query Design',
    description:
      'The ability to write correct, efficient SQL queries in the context of a production-like PostgreSQL schema.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220002',
    slug: 'db-concurrency',
    name: 'Database Concurrency & Locking',
    description:
      'Managing transactions, isolation levels, row-level locks, and preventing race conditions or deadlocks.',
    track: 'backend-node',
    status: 'active',
    prerequisites: ['22222222-2222-2222-2222-222222220001'],
  },
  {
    id: '22222222-2222-2222-2222-222222220003',
    slug: 'api-error-handling',
    name: 'API Error Handling & Resilience',
    description:
      'Designing robust error contracts, graceful exception boundaries, and meaningful status codes.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220004',
    slug: 'async-queue-processing',
    name: 'Asynchronous Queue Processing',
    description: 'Implementing background job pipelines, idempotency keys, and dead-letter queues.',
    track: 'backend-node',
    status: 'active',
    prerequisites: ['22222222-2222-2222-2222-222222220003'],
  },
  {
    id: '22222222-2222-2222-2222-222222220005',
    slug: 'auth-session-management',
    name: 'Authentication & Session Management',
    description:
      'Secure token issuance, JWT verification, revocation strategies, and role-based access control.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220006',
    slug: 'cache-invalidation',
    name: 'Caching Strategies & Invalidation',
    description: 'Write-through, cache-aside, TTL policies, and atomic cache stampede prevention.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220007',
    slug: 'schema-migration-safety',
    name: 'Zero-Downtime Schema Migrations',
    description:
      'Expand-contract patterns, backwards-compatible schema evolutions, and lock contention avoidance.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220008',
    slug: 'distributed-tracing',
    name: 'Distributed Tracing & Observability',
    description:
      'Context propagation, structured logging, metric instrumentation, and SLI/SLO alerting.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220009',
    slug: 'rate-limiting',
    name: 'Rate Limiting & Traffic Shaping',
    description: 'Token bucket, sliding window rate limits, and DDoS protection for public APIs.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220010',
    slug: 'event-driven-architecture',
    name: 'Event-Driven Architecture',
    description: 'Publish-subscribe mechanisms, event sourcing primitives, and outbox patterns.',
    track: 'backend-node',
    status: 'active',
    prerequisites: [],
  },
  {
    id: '22222222-2222-2222-2222-222222220011',
    slug: 'connection-pooling',
    name: 'Connection Pool Sizing & Management',
    description: 'Configuring client pools, transaction lifecycle boundaries, and leak detection.',
    track: 'backend-node',
    status: 'active',
    prerequisites: ['22222222-2222-2222-2222-222222220002'],
  },
  {
    id: '22222222-2222-2222-2222-222222220012',
    slug: 'idempotent-api-design',
    name: 'Idempotent API Design',
    description:
      'Implementing IETF idempotency keys, replay defense, and safe retries in REST APIs.',
    track: 'backend-node',
    status: 'active',
    prerequisites: ['22222222-2222-2222-2222-222222220003'],
  },
];

export const SKILL_EDGES: SkillEdge[] = [
  {
    fromSkillId: '22222222-2222-2222-2222-222222220001',
    toSkillId: '22222222-2222-2222-2222-222222220002',
    edgeType: 'prerequisite',
  },
  {
    fromSkillId: '22222222-2222-2222-2222-222222220002',
    toSkillId: '22222222-2222-2222-2222-222222220011',
    edgeType: 'prerequisite',
  },
  {
    fromSkillId: '22222222-2222-2222-2222-222222220003',
    toSkillId: '22222222-2222-2222-2222-222222220004',
    edgeType: 'prerequisite',
  },
  {
    fromSkillId: '22222222-2222-2222-2222-222222220003',
    toSkillId: '22222222-2222-2222-2222-222222220012',
    edgeType: 'prerequisite',
  },
  {
    fromSkillId: '22222222-2222-2222-2222-222222220006',
    toSkillId: '22222222-2222-2222-2222-222222220009',
    edgeType: 'related',
  },
];

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: '55555555-5555-5555-5555-555555550001',
    slug: 'n-plus-one-detection',
    name: 'Detect and Fix N+1 Query',
    description:
      'Learner must identify an N+1 query pattern in product category resolution, explain the latency overhead, and apply a batched join fix.',
    skillId: '22222222-2222-2222-2222-222222220001',
    supportingSkillIds: [],
    mode: 'debug',
    difficultyRange: [1, 3],
    status: 'active',
  },
  {
    id: '55555555-5555-5555-5555-555555550002',
    slug: 'order-concurrency-race',
    name: 'Fix Order Inventory Race Condition',
    description:
      'Prevent overselling and negative stock under concurrent checkout requests by applying pessimistic locking or atomic checks.',
    skillId: '22222222-2222-2222-2222-222222220002',
    supportingSkillIds: ['22222222-2222-2222-2222-222222220001'],
    mode: 'fix',
    difficultyRange: [2, 4],
    status: 'active',
  },
  {
    id: '55555555-5555-5555-5555-555555550003',
    slug: 'error-contract-resilience',
    name: 'Standardize API Error Contracts',
    description:
      'Replace unhandled asynchronous rejections and inconsistent payloads with centralized AppError handling middleware.',
    skillId: '22222222-2222-2222-2222-222222220003',
    supportingSkillIds: [],
    mode: 'fix',
    difficultyRange: [1, 3],
    status: 'active',
  },
  {
    id: '55555555-5555-5555-5555-555555550004',
    slug: 'dead-letter-retry',
    name: 'Implement Queue Retries & Dead Letter Routing',
    description:
      'Build reliable asynchronous job processing with exponential backoff and dead-letter queue escalation.',
    skillId: '22222222-2222-2222-2222-222222220004',
    supportingSkillIds: ['22222222-2222-2222-2222-222222220003'],
    mode: 'build',
    difficultyRange: [2, 5],
    status: 'active',
  },
];

export const RUBRICS: Rubric[] = [
  {
    id: '44444444-4444-4444-4444-444444440001',
    name: 'N+1 Query Resolution Rubric',
    criteria: [
      {
        id: 'crit-n1-1',
        criterion: 'Identifies that individual queries are being executed inside a loop',
        weight: 0.4,
      },
      {
        id: 'crit-n1-2',
        criterion: 'Explains network and database round-trip performance degradation',
        weight: 0.3,
      },
      {
        id: 'crit-n1-3',
        criterion: 'Proposes relational JOIN or batched IN-clause lookup fix',
        weight: 0.3,
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444440002',
    name: 'Order Concurrency Defense Rubric',
    criteria: [
      {
        id: 'crit-occ-1',
        criterion: 'Pinpoints check-then-act race window in inventory reservation',
        weight: 0.4,
      },
      {
        id: 'crit-occ-2',
        criterion: 'Implements explicit row-level locking (SELECT FOR UPDATE) or atomic updates',
        weight: 0.4,
      },
      {
        id: 'crit-occ-3',
        criterion: 'Verifies transaction rollback and isolation boundary semantics',
        weight: 0.2,
      },
    ],
  },
];

export const MISCONCEPTIONS: Misconception[] = [
  {
    id: '33333333-3333-3333-3333-333333330001',
    slug: 'joins-always-slower',
    description:
      'Belief that multiple individual indexed SELECTs are faster than a single relational JOIN.',
    skillId: '22222222-2222-2222-2222-222222220001',
    status: 'active',
  },
  {
    id: '33333333-3333-3333-3333-333333330002',
    slug: 'read-uncommitted-safe',
    description:
      'Belief that wrapping queries in a basic BEGIN/COMMIT transaction prevents race conditions without row locking.',
    skillId: '22222222-2222-2222-2222-222222220002',
    status: 'active',
  },
  {
    id: '33333333-3333-3333-3333-333333330003',
    slug: 'try-catch-everywhere',
    description:
      'Belief that wrapping every single line in individual try-catch blocks is superior to standardized error middleware.',
    skillId: '22222222-2222-2222-2222-222222220003',
    status: 'active',
  },
  {
    id: '33333333-3333-3333-3333-333333330004',
    slug: 'fire-and-forget-safe',
    description:
      'Belief that background async promises without catch handlers do not risk process termination or memory leaks.',
    skillId: '22222222-2222-2222-2222-222222220004',
    status: 'active',
  },
];

export const FAULT_PATTERNS: FaultPattern[] = [
  {
    id: '88888888-8888-8888-8888-888888880001',
    slug: 'n-plus-one-query',
    name: 'N+1 Query Pattern',
    description: 'Iterative database querying inside application iteration loop.',
    patternType: 'n-plus-one',
    referenceSystemId: '11111111-1111-1111-1111-111111111111',
    status: 'active',
  },
  {
    id: '88888888-8888-8888-8888-888888880002',
    slug: 'lost-update-race',
    name: 'Lost Update Concurrency Hazard',
    description:
      'Unsynchronized read-modify-write cycle resulting in negative or inconsistent inventory.',
    patternType: 'race-condition',
    referenceSystemId: '11111111-1111-1111-1111-111111111111',
    status: 'active',
  },
];

export const VARIANTS: Variant[] = [
  {
    id: '66666666-6666-6666-6666-666666660001',
    templateId: '55555555-5555-5555-5555-555555550001',
    referenceSystemId: '11111111-1111-1111-1111-111111111111',
    version: 1,
    title: 'Shopverse: Products endpoint is slow',
    narrative:
      'A Datadog APM alert fired indicating GET /products p95 latency reached 2,400ms. Investigate and eliminate the N+1 query loop.',
    instructions:
      '1. Inspect src/routes/products.ts.\n2. Note how product categories are fetched in a loop.\n3. Replace loop queries with a single query using JOIN or batched WHERE IN.\n4. Verify tests pass.',
    factSheet:
      '## Shopverse Products Architecture\n- Schema: products (id, name, price, category_id), categories (id, name).\n- The /products endpoint lists 50 items per page.\n- Current code executes 1 query for products + 50 queries for categories.',
    hintLadder: [
      {
        index: 1,
        text: 'Have you inspected the database query count during a single GET /products request?',
      },
      {
        index: 2,
        text: 'Observe how each product item awaits a separate category lookup inside the map loop.',
      },
      {
        index: 3,
        text: 'Use an SQL JOIN or fetch all category IDs in a single batched query before mapping.',
      },
    ],
    explanation:
      'Classic N+1 query pattern where child relations are fetched iteratively rather than in a set-oriented relational query.',
    difficulty: 2,
    estimatedMinutes: 25,
    status: 'published',
    misconceptionIds: ['33333333-3333-3333-3333-333333330001'],
    vivaQuestionIds: [
      '77777777-7777-7777-7777-777777770001',
      '77777777-7777-7777-7777-777777770002',
      '77777777-7777-7777-7777-777777770003',
      '77777777-7777-7777-7777-777777770004',
    ],
    rubricId: '44444444-4444-4444-4444-444444440001',
    publishedAt: '2026-10-09T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666660002',
    templateId: '55555555-5555-5555-5555-555555550002',
    referenceSystemId: '11111111-1111-1111-1111-111111111111',
    version: 1,
    title: 'Shopverse: Concurrent order placement inventory race',
    narrative:
      'High concurrency during a flash sale caused products to sell below 0 stock. Protect the inventory decrement with row locking.',
    instructions:
      '1. Inspect src/services/orderService.ts.\n2. Notice how stock is checked in a SELECT and updated in a later UPDATE without locking.\n3. Add SELECT ... FOR UPDATE or an atomic decrement with stock >= quantity.\n4. Run the concurrency integration test.',
    factSheet:
      '## Shopverse Order Processing\n- Products have a stock column.\n- Multiple simultaneous checkout requests can read the same stock value before either transaction commits.',
    hintLadder: [
      {
        index: 1,
        text: 'What happens if two concurrent requests read stock = 1 before either decrements?',
      },
      {
        index: 2,
        text: 'Consider row-level locking with SELECT ... FOR UPDATE inside the transaction.',
      },
      {
        index: 3,
        text: 'Ensure both the read and update happen within the exact same transaction block.',
      },
    ],
    explanation:
      'Check-then-act race condition resolved through pessimistic row locking or conditional atomic updates.',
    difficulty: 3,
    estimatedMinutes: 30,
    status: 'published',
    misconceptionIds: ['33333333-3333-3333-3333-333333330002'],
    vivaQuestionIds: [
      '77777777-7777-7777-7777-777777770005',
      '77777777-7777-7777-7777-777777770006',
      '77777777-7777-7777-7777-777777770007',
      '77777777-7777-7777-7777-777777770008',
    ],
    rubricId: '44444444-4444-4444-4444-444444440002',
    publishedAt: '2026-10-09T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666660003',
    templateId: '55555555-5555-5555-5555-555555550003',
    referenceSystemId: '11111111-1111-1111-1111-111111111111',
    version: 1,
    title: 'Shopverse: Centralized error handling normalization',
    narrative:
      'Several endpoints return unformatted 500 error strings and leak stack traces in production. Standardize error handling.',
    instructions:
      '1. Create a structured AppError class with statusCode and errorCode.\n2. Implement Express 4-argument error middleware (err, req, res, next).\n3. Ensure JSON responses conform to the standard error envelope.',
    factSheet:
      '## Shopverse API Standards\n- Error format must match: { error: { code: string, message: string, details?: any } }.\n- Status codes: 400 for bad input, 404 for missing items, 409 for conflicts, 500 for internal errors.',
    hintLadder: [
      {
        index: 1,
        text: 'Look at the arguments for the Express error middleware. It requires four parameters.',
      },
      {
        index: 2,
        text: 'Check if asynchronous errors are passed to next(err) or handled via Express 5 automatic promise rejection.',
      },
      {
        index: 3,
        text: 'Ensure no stack traces are included in the JSON payload when NODE_ENV is production.',
      },
    ],
    explanation:
      'Centralized error boundary middleware ensures consistent client API contracts and prevents internal data leakage.',
    difficulty: 1,
    estimatedMinutes: 20,
    status: 'published',
    misconceptionIds: ['33333333-3333-3333-3333-333333330003'],
    vivaQuestionIds: [
      '77777777-7777-7777-7777-777777770009',
      '77777777-7777-7777-7777-777777770010',
      '77777777-7777-7777-7777-777777770011',
      '77777777-7777-7777-7777-777777770012',
    ],
    rubricId: null,
    publishedAt: '2026-10-09T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666660004',
    templateId: '55555555-5555-5555-5555-555555550002',
    referenceSystemId: '11111111-1111-1111-1111-111111111111',
    version: 2,
    title: 'Shopverse: Transfer Task - High-Concurrency Flash Sale Protection',
    narrative:
      'Independent transfer challenge: A new high-throughput checkout route has been deployed. Prove your concurrency mastery with AI assistance disabled.',
    instructions:
      '1. Review the checkout service.\n2. Ensure inventory deductions are completely protected against race conditions.\n3. Note: Socratic mentor and hints are unavailable for this transfer task.',
    factSheet:
      '## Transfer Task Fact Sheet\n- High concurrency simulated across 50 simultaneous parallel workers.\n- Stock must never drop below 0.\n- Successful checkout must match exact inventory limits.',
    hintLadder: [
      { index: 1, text: 'Hints are disabled during transfer tasks.' },
      { index: 2, text: 'Hints are disabled during transfer tasks.' },
      { index: 3, text: 'Hints are disabled during transfer tasks.' },
    ],
    explanation:
      'Transfer task evaluating independent mastery of database transaction isolation and pessimistic concurrency.',
    difficulty: 3,
    estimatedMinutes: 30,
    status: 'published',
    misconceptionIds: ['33333333-3333-3333-3333-333333330002'],
    vivaQuestionIds: [
      '77777777-7777-7777-7777-777777770005',
      '77777777-7777-7777-7777-777777770006',
      '77777777-7777-7777-7777-777777770007',
      '77777777-7777-7777-7777-777777770008',
    ],
    rubricId: '44444444-4444-4444-4444-444444440002',
    publishedAt: '2026-10-09T00:00:00Z',
  },
];
