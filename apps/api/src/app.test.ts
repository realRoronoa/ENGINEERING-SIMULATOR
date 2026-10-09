import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import * as database from '@engineering-simulator/database';
import { defaultGradingWorker } from '@engineering-simulator/worker';
import { buildApp } from './app.js';

describe('API Server Suite', () => {
  const app = buildApp();

  describe('Health Endpoints', () => {
    it('GET /health returns 200 OK with valid health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe('0.0.1');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('GET /health/ready returns 200 when database query succeeds', async () => {
      vi.spyOn(database, 'query').mockResolvedValueOnce({
        rows: [{ '?column?': 1 }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });

    it('GET /health/ready returns 503 when database is unreachable', async () => {
      vi.spyOn(database, 'query').mockRejectedValueOnce(new Error('Connection refused'));

      const response = await request(app).get('/health/ready');
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('error');
      expect(response.body.database).toBe('disconnected');
    });
  });

  describe('/v1/sessions Endpoint', () => {
    it('rejects unauthenticated session requests with 401', async () => {
      const response = await request(app).post('/v1/sessions').send({ mode: 'practice' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('validates session mode with 400 on invalid payload', async () => {
      const response = await request(app)
        .post('/v1/sessions')
        .set('Authorization', 'Bearer test-token')
        .send({ mode: 'invalid-mode' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates session and returns 201 on valid request', async () => {
      vi.spyOn(database, 'createSession').mockResolvedValueOnce({
        id: 'sess-123',
        learner_id: 'learner_test-token',
        mode: 'practice',
        started_at: new Date('2026-10-09T12:00:00Z'),
      });

      const response = await request(app)
        .post('/v1/sessions')
        .set('Authorization', 'Bearer test-token')
        .send({ mode: 'practice' });

      expect(response.status).toBe(201);
      expect(response.body.sessionId).toBe('sess-123');
      expect(response.body.createdAt).toBeDefined();
    });

    it('POST /v1/sessions/:id/next rejects unauthenticated request with 401', async () => {
      const response = await request(app).post('/v1/sessions/sess-123/next');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /v1/sessions/:id/next returns 404 when session not found', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/sessions/sess-nonexistent/next')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });

    it('POST /v1/sessions/:id/next returns 403 when session is not owned by learner', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce({
        id: 'sess-other',
        learner_id: 'someone-else',
        mode: 'debug',
        started_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/sessions/sess-other/next')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('POST /v1/sessions/:id/next returns 409 when session has active attempt', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce({
        id: 'sess-123',
        learner_id: 'learner_test-token',
        mode: 'debug',
        started_at: new Date(),
      });

      vi.spyOn(database, 'getActiveAttemptForSession').mockResolvedValueOnce({
        id: 'att-active',
        session_id: 'sess-123',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/sessions/sess-123/next')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('SESSION_HAS_ACTIVE_ATTEMPT');
      expect(response.body.error.details.activeAttemptId).toBe('att-active');
    });

    it('POST /v1/sessions/:id/next successfully selects task and returns 201', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce({
        id: 'sess-123',
        learner_id: 'learner_test-token',
        mode: 'debug',
        started_at: new Date(),
      });

      vi.spyOn(database, 'getActiveAttemptForSession').mockResolvedValueOnce(null);

      vi.spyOn(database, 'fetchSelectionContext').mockResolvedValueOnce({
        currentMastery: { 'skill-db': 0.2 },
        recentVariantIds: [],
        activeMisconceptions: [],
        availableSkills: [
          { id: 'skill-db', slug: 'sql-transactions', name: 'SQL Transactions', prerequisites: [] },
        ],
        availableVariants: [
          {
            id: 'var-sql-101',
            templateId: 'tmpl-1',
            skillId: 'skill-db',
            taskMode: 'debug',
            difficulty: 1,
            status: 'published',
          },
        ],
      });

      vi.spyOn(database, 'createAttempt').mockResolvedValueOnce({
        id: 'att-new-999',
        session_id: 'sess-123',
        learner_id: 'learner_test-token',
        variant_id: 'var-sql-101',
        status: 'created',
        selector_decision: { reason: 'test-reason' },
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      vi.spyOn(database, 'getVariantWithDetails').mockResolvedValueOnce({
        id: 'var-sql-101',
        variantId: 'var-sql-101',
        templateId: 'tmpl-1',
        title: 'Fix Dirty Read in Checkout',
        narrative: 'Checkout service fails under concurrency',
        instructions: 'Add transaction isolation level serializable or locking',
        mode: 'debug',
        difficulty: 1,
        skillIds: ['skill-db'],
        estimatedMinutes: 25,
        factSheet: 'Shopverse orders documentation',
        referenceSystem: {
          name: 'shopverse',
          dockerImage: 'engineering-simulator/shopverse:latest',
        },
      });

      const response = await request(app)
        .post('/v1/sessions/sess-123/next')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(201);
      expect(response.body.attemptId).toBe('att-new-999');
      expect(response.body.task.title).toBe('Fix Dirty Read in Checkout');
      expect(response.body.task.referenceSystem.name).toBe('shopverse');
      expect(response.body.selectorReason).toBeDefined();
    });
  });

  describe('/v1/attempts Endpoint', () => {
    it('rejects unauthenticated attempt queries with 401', async () => {
      const response = await request(app).get('/v1/attempts/att-123');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 404 when attempt is not found', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/v1/attempts/att-nonexistent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
    });

    it('returns 403 when learner does not own the attempt', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-123',
        session_id: 'sess-1',
        learner_id: 'different-learner-id',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      const response = await request(app)
        .get('/v1/attempts/att-123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 200 and attempt data for owner', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-123',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 1,
        submissions_count: 2,
        started_at: new Date('2026-10-09T12:00:00Z'),
        created_at: new Date('2026-10-09T12:00:00Z'),
      });

      const response = await request(app)
        .get('/v1/attempts/att-123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.attempt.id).toBe('att-123');
      expect(response.body.attempt.hintsUsed).toBe(1);
      expect(response.body.attempt.submissionsCount).toBe(2);
    });

    it('POST /v1/attempts/:id/submissions rejects unauthenticated request with 401', async () => {
      const response = await request(app)
        .post('/v1/attempts/att-123/submissions')
        .send({ patch: 'valid patch' });
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /v1/attempts/:id/submissions validates patch syntax with 400', async () => {
      const response = await request(app)
        .post('/v1/attempts/att-123/submissions')
        .set('Authorization', 'Bearer test-token')
        .send({ patch: 'not a unified diff' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PATCH');
    });

    it('POST /v1/attempts/:id/submissions rejects attempt in completed state with 409', async () => {
      const validPatch = '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1,1 +1,1 @@\n-old\n+new\n';

      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-123',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'completed',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-123/submissions')
        .set('Authorization', 'Bearer test-token')
        .send({ patch: validPatch });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_IN_WORKING_STATE');
    });

    it('POST /v1/attempts/:id/submissions accepts valid patch and returns 202 queued', async () => {
      const validPatch = '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1,1 +1,1 @@\n-old\n+new\n';

      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-123',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      vi.spyOn(database, 'createSubmission').mockResolvedValueOnce({
        id: 'sub-new-456',
        attempt_id: 'att-123',
        learner_id: 'learner_test-token',
        patch: validPatch,
        structured_answers: {},
        client_checksum: 'abc',
        status: 'queued',
        submitted_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-123/submissions')
        .set('Authorization', 'Bearer test-token')
        .send({ patch: validPatch, clientChecksum: 'abc' });

      expect(response.status).toBe(202);
      expect(response.body.submissionId).toBe('sub-new-456');
      expect(response.body.status).toBe('queued');
      expect(response.body.pollingUrl).toBe('/v1/submissions/sub-new-456');
    });
  });

  describe('/v1/submissions Endpoint', () => {
    it('GET /v1/submissions/:id rejects unauthenticated request with 401', async () => {
      const response = await request(app).get('/v1/submissions/sub-123');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /v1/submissions/:id returns 404 when submission not found', async () => {
      vi.spyOn(database, 'getSubmissionWithEvaluation').mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/v1/submissions/sub-nonexistent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('SUBMISSION_NOT_FOUND');
    });

    it('GET /v1/submissions/:id returns 200 and evaluation result for owner', async () => {
      vi.spyOn(database, 'getSubmissionWithEvaluation').mockResolvedValueOnce({
        submission: {
          id: 'sub-123',
          attempt_id: 'att-1',
          learner_id: 'learner_test-token',
          patch: 'diff',
          structured_answers: {},
          client_checksum: 'checksum',
          status: 'complete',
          submitted_at: new Date('2026-10-09T12:00:00Z'),
        },
        evaluation: {
          id: 'eval-1',
          submission_id: 'sub-123',
          attempt_id: 'att-1',
          patch_valid: true,
          public_tests_passed: 5,
          public_tests_total: 5,
          hidden_tests_passed: 3,
          hidden_tests_total: 3,
          benchmarks_passed: null,
          structured_answers_result: {},
          rubric_results: null,
          passed: true,
          score: 1.0,
          created_at: new Date(),
        },
      });

      const response = await request(app)
        .get('/v1/submissions/sub-123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.submissionId).toBe('sub-123');
      expect(response.body.status).toBe('complete');
      expect(response.body.evaluation.passed).toBe(true);
      expect(response.body.evaluation.publicTestsPassed).toBe(5);
      expect(response.body.evaluation.hiddenTestsPassed).toBe(3);
    });
  });

  describe('End-to-End Submission Pipeline Wiring', () => {
    const validPatch = '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1,1 +1,1 @@\n-old\n+new\n';

    it('submits patch, queues in worker, processes grading, and returns evaluated status via polling', async () => {
      defaultGradingWorker.clear();

      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-e2e',
        session_id: 'sess-e2e',
        learner_id: 'learner_test-token',
        variant_id: 'var-e2e',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      vi.spyOn(database, 'createSubmission').mockResolvedValueOnce({
        id: 'sub-e2e-1',
        attempt_id: 'att-e2e',
        learner_id: 'learner_test-token',
        patch: validPatch,
        structured_answers: {},
        client_checksum: 'checksum',
        status: 'queued',
        submitted_at: new Date(),
      });

      // 1. Submit patch via HTTP
      const postRes = await request(app)
        .post('/v1/attempts/att-e2e/submissions')
        .set('Authorization', 'Bearer test-token')
        .send({ patch: validPatch });

      expect(postRes.status).toBe(202);
      expect(postRes.body.submissionId).toBe('sub-e2e-1');
      expect(defaultGradingWorker.getQueueLength()).toBe(1);

      // 2. Mock database operations for worker evaluation
      vi.spyOn(database, 'updateSubmissionStatus').mockResolvedValueOnce({
        id: 'sub-e2e-1',
        attempt_id: 'att-e2e',
        learner_id: 'learner_test-token',
        patch: validPatch,
        structured_answers: {},
        client_checksum: 'checksum',
        status: 'complete',
        submitted_at: new Date(),
      });

      vi.spyOn(database, 'createEvaluation').mockResolvedValueOnce({
        id: 'eval-e2e-1',
        submission_id: 'sub-e2e-1',
        attempt_id: 'att-e2e',
        patch_valid: true,
        public_tests_passed: 1,
        public_tests_total: 1,
        hidden_tests_passed: 1,
        hidden_tests_total: 1,
        benchmarks_passed: null,
        structured_answers_result: {},
        rubric_results: null,
        passed: true,
        score: 1.0,
        created_at: new Date(),
      });

      vi.spyOn(database, 'updateAttemptStatus').mockResolvedValueOnce({
        id: 'att-e2e',
        session_id: 'sess-e2e',
        learner_id: 'learner_test-token',
        variant_id: 'var-e2e',
        status: 'evaluated',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      vi.spyOn(database, 'recordEvidenceEvent').mockResolvedValueOnce({
        id: 'ev-e2e-1',
        learner_id: 'learner_test-token',
        attempt_id: 'att-e2e',
        skill_id: 'var-e2e',
        evidence_type: 'practice',
        passed: true,
        score: 1.0,
        difficulty: 2,
        task_mode: 'debug',
        occurred_at: new Date(),
      });

      vi.spyOn(database, 'getSkillState').mockResolvedValueOnce(null);

      vi.spyOn(database, 'upsertSkillState').mockResolvedValueOnce({
        id: 'state-e2e-1',
        learner_id: 'learner_test-token',
        skill_id: 'var-e2e',
        alpha: 2.0,
        beta: 3.0,
        mastery: 0.4,
        evidence_count: 1,
        updated_at: new Date(),
      });

      // 3. Worker processes next job
      const jobResult = await defaultGradingWorker.processNextJob();
      expect(jobResult?.status).toBe('complete');
      expect(jobResult?.evaluation.status).toBe('PASS');
      expect(defaultGradingWorker.getQueueLength()).toBe(0);

      // 4. Poll submission endpoint
      vi.spyOn(database, 'getSubmissionWithEvaluation').mockResolvedValueOnce({
        submission: {
          id: 'sub-e2e-1',
          attempt_id: 'att-e2e',
          learner_id: 'learner_test-token',
          patch: validPatch,
          structured_answers: {},
          client_checksum: 'checksum',
          status: 'complete',
          submitted_at: new Date(),
        },
        evaluation: {
          id: 'eval-e2e-1',
          submission_id: 'sub-e2e-1',
          attempt_id: 'att-e2e',
          patch_valid: true,
          public_tests_passed: 1,
          public_tests_total: 1,
          hidden_tests_passed: 1,
          hidden_tests_total: 1,
          benchmarks_passed: null,
          structured_answers_result: {},
          rubric_results: null,
          passed: true,
          score: 1.0,
          created_at: new Date(),
        },
      });

      const pollRes = await request(app)
        .get('/v1/submissions/sub-e2e-1')
        .set('Authorization', 'Bearer test-token');

      expect(pollRes.status).toBe(200);
      expect(pollRes.body.status).toBe('complete');
      expect(pollRes.body.evaluation.passed).toBe(true);
      expect(pollRes.body.evaluation.publicTestsPassed).toBe(1);
      expect(pollRes.body.evaluation.hiddenTestsPassed).toBe(1);
    });
  });
});
