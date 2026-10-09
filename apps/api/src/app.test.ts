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

  describe('Viva Oral Defense & Attempt Lifecycle Endpoints', () => {
    it('POST /v1/attempts/:id/viva rejects unauthenticated request with 401', async () => {
      const response = await request(app).post('/v1/attempts/att-1/viva');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /v1/attempts/:id/viva returns 404 when attempt not found', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/attempts/att-missing/viva')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
    });

    it('POST /v1/attempts/:id/viva returns 409 when attempt is not in evaluated state', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-1',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-1/viva')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_IN_EVALUATED_STATE');
    });

    it('POST /v1/attempts/:id/viva creates viva session and returns 201 with first question', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-eval',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'evaluated',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      vi.spyOn(database, 'createVivaRecord').mockResolvedValueOnce({
        id: 'viva-101',
        attempt_id: 'att-eval',
        learner_id: 'learner_test-token',
        questions: [
          {
            id: 'viva-q-1',
            text: 'Can you explain the root cause?',
            type: 'authored',
          },
        ],
        answers: [],
        status: 'in-progress',
        started_at: new Date(),
      });

      vi.spyOn(database, 'updateAttemptStatus').mockResolvedValueOnce({
        id: 'att-eval',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'viva',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-eval/viva')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(201);
      expect(response.body.vivaId).toBe('viva-101');
      expect(response.body.firstQuestion.id).toBe('viva-q-1');
      expect(response.body.firstQuestion.text).toBe('Can you explain the root cause?');
    });

    it('POST /v1/attempts/:id/viva/answers rejects invalid payload format with 400', async () => {
      const response = await request(app)
        .post('/v1/attempts/att-eval/viva/answers')
        .set('Authorization', 'Bearer test-token')
        .send({ vivaId: 'viva-101' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /v1/attempts/:id/viva/answers returns 409 when attempt not in viva state', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-eval',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'evaluated',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-eval/viva/answers')
        .set('Authorization', 'Bearer test-token')
        .send({
          vivaId: 'viva-101',
          questionId: 'viva-q-1',
          answer: 'Root cause was missing locks.',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('VIVA_NOT_STARTED');
    });

    it('POST /v1/attempts/:id/viva/answers advances to next question when more remain', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-viva',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'viva',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      vi.spyOn(database, 'getVivaRecordById').mockResolvedValueOnce({
        id: 'viva-101',
        attempt_id: 'att-viva',
        learner_id: 'learner_test-token',
        questions: [
          { id: 'viva-q-1', text: 'Question 1', type: 'authored' },
          { id: 'viva-q-2', text: 'Question 2', type: 'authored' },
        ],
        answers: [],
        status: 'in-progress',
        started_at: new Date(),
      });

      vi.spyOn(database, 'addVivaAnswer').mockResolvedValueOnce({
        id: 'viva-101',
        attempt_id: 'att-viva',
        learner_id: 'learner_test-token',
        questions: [
          { id: 'viva-q-1', text: 'Question 1', type: 'authored' },
          { id: 'viva-q-2', text: 'Question 2', type: 'authored' },
        ],
        answers: [{ questionId: 'viva-q-1', answer: 'Answer 1' }],
        status: 'in-progress',
        started_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-viva/viva/answers')
        .set('Authorization', 'Bearer test-token')
        .send({
          vivaId: 'viva-101',
          questionId: 'viva-q-1',
          answer: 'Because stock checking was not serialized.',
        });

      expect(response.status).toBe(200);
      expect(response.body.vivaComplete).toBe(false);
      expect(response.body.nextQuestion.id).toBe('viva-q-2');
    });

    it('POST /v1/attempts/:id/viva/answers marks vivaComplete: true on final question', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-viva',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'viva',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      vi.spyOn(database, 'getVivaRecordById').mockResolvedValueOnce({
        id: 'viva-101',
        attempt_id: 'att-viva',
        learner_id: 'learner_test-token',
        questions: [{ id: 'viva-q-2', text: 'Question 2', type: 'authored' }],
        answers: [{ questionId: 'viva-q-1', answer: 'Answer 1' }],
        status: 'in-progress',
        started_at: new Date(),
      });

      vi.spyOn(database, 'addVivaAnswer').mockResolvedValueOnce({
        id: 'viva-101',
        attempt_id: 'att-viva',
        learner_id: 'learner_test-token',
        questions: [{ id: 'viva-q-2', text: 'Question 2', type: 'authored' }],
        answers: [
          { questionId: 'viva-q-1', answer: 'Answer 1' },
          { questionId: 'viva-q-2', answer: 'Answer 2' },
        ],
        status: 'complete',
        started_at: new Date(),
        completed_at: new Date(),
      });

      const updateAttemptSpy = vi.spyOn(database, 'updateAttemptStatus').mockResolvedValueOnce({
        id: 'att-viva',
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
        .post('/v1/attempts/att-viva/viva/answers')
        .set('Authorization', 'Bearer test-token')
        .send({
          vivaId: 'viva-101',
          questionId: 'viva-q-2',
          answer: 'Added row locks to enforce serializability.',
        });

      expect(response.status).toBe(200);
      expect(response.body.vivaComplete).toBe(true);
      expect(response.body.nextQuestion).toBeNull();
      expect(updateAttemptSpy).toHaveBeenCalledWith('att-viva', 'completed');
    });

    it('POST /v1/attempts/:id/abandon marks attempt status as abandoned', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-abandon',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      const updateAttemptSpy = vi.spyOn(database, 'updateAttemptStatus').mockResolvedValueOnce({
        id: 'att-abandon',
        session_id: 'sess-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'abandoned',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/attempts/att-abandon/abandon')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.attemptId).toBe('att-abandon');
      expect(response.body.status).toBe('abandoned');
      expect(updateAttemptSpy).toHaveBeenCalledWith('att-abandon', 'abandoned');
    });
  });

  describe('Hint Ladder & AI Mentor Endpoints', () => {
    const mockAttempt = {
      id: 'att-hint-1',
      session_id: 'sess-1',
      learner_id: 'learner_test-token',
      variant_id: 'var-shopverse-1',
      status: 'working' as const,
      selector_decision: {},
      hints_used: 0,
      submissions_count: 0,
      created_at: new Date(),
    };

    const mockVariantData = {
      id: 'var-shopverse-1',
      title: 'Order Atomicity Bug',
      instructions: 'Fix race condition during concurrent order placement',
      factSheet:
        'Orders and inventory must update atomically. Row locking prevents concurrent stock overdrafts.',
      hintLadder: [
        {
          index: 1,
          text: 'Check the transaction boundary around order creation and stock update.',
        },
        {
          index: 2,
          text: 'Use SELECT FOR UPDATE on inventory items to prevent concurrent decrement.',
        },
      ],
      mode: 'fix',
    };

    describe('POST /v1/attempts/:id/hints', () => {
      it('rejects unauthenticated hint requests with 401', async () => {
        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .send({ currentHintIndex: 0 });

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });

      it('rejects invalid body with 400', async () => {
        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: -1 });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('returns 404 when attempt is not found', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(null);

        const response = await request(app)
          .post('/v1/attempts/att-nonexistent/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 0 });

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
      });

      it('returns 403 when attempt belongs to another learner', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
          ...mockAttempt,
          learner_id: 'other-learner',
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 0 });

        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('returns 409 when attempt is in non-working status', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
          ...mockAttempt,
          status: 'evaluated',
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 0 });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('ATTEMPT_NOT_IN_WORKING_STATE');
      });

      it('returns 409 when attempt is in transfer mode', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
        vi.spyOn(database, 'getVariantHintData').mockResolvedValueOnce({
          ...mockVariantData,
          mode: 'transfer',
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 0 });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('HINTS_NOT_ALLOWED_IN_TRANSFER');
      });

      it('successfully returns the first authored hint and increments counter', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
        vi.spyOn(database, 'getVariantHintData').mockResolvedValueOnce(mockVariantData);
        const recordHintSpy = vi.spyOn(database, 'recordHintEvent').mockResolvedValueOnce({
          id: 'he-1',
          attempt_id: mockAttempt.id,
          learner_id: mockAttempt.learner_id,
          hint_index: 1,
          requested_at: new Date(),
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 0 });

        expect(response.status).toBe(200);
        expect(response.body.hint).toEqual({
          index: 1,
          text: 'Check the transaction boundary around order creation and stock update.',
          type: 'authored',
          isLast: false,
        });
        expect(recordHintSpy).toHaveBeenCalledWith(mockAttempt.id, mockAttempt.learner_id, 1);
      });

      it('returns last hint marked with isLast: true', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
        vi.spyOn(database, 'getVariantHintData').mockResolvedValueOnce(mockVariantData);
        vi.spyOn(database, 'recordHintEvent').mockResolvedValueOnce({
          id: 'he-2',
          attempt_id: mockAttempt.id,
          learner_id: mockAttempt.learner_id,
          hint_index: 2,
          requested_at: new Date(),
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 1 });

        expect(response.status).toBe(200);
        expect(response.body.hint.index).toBe(2);
        expect(response.body.hint.isLast).toBe(true);
      });

      it('returns 409 ALL_HINTS_EXHAUSTED when currentHintIndex exceeds available hints', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
        vi.spyOn(database, 'getVariantHintData').mockResolvedValueOnce(mockVariantData);

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/hints')
          .set('Authorization', 'Bearer test-token')
          .send({ currentHintIndex: 2 });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('ALL_HINTS_EXHAUSTED');
      });
    });

    describe('POST /v1/attempts/:id/mentor', () => {
      it('rejects unauthenticated mentor request with 401', async () => {
        const response = await request(app)
          .post('/v1/attempts/att-hint-1/mentor')
          .send({ message: 'How do I solve this?' });

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });

      it('rejects empty message with 400 VALIDATION_ERROR', async () => {
        const response = await request(app)
          .post('/v1/attempts/att-hint-1/mentor')
          .set('Authorization', 'Bearer test-token')
          .send({ message: '   ' });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('returns 404 when attempt is not found', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(null);

        const response = await request(app)
          .post('/v1/attempts/att-nonexistent/mentor')
          .set('Authorization', 'Bearer test-token')
          .send({ message: 'How does locking work?' });

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
      });

      it('returns 403 when attempt belongs to another learner', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
          ...mockAttempt,
          learner_id: 'someone-else',
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/mentor')
          .set('Authorization', 'Bearer test-token')
          .send({ message: 'Can you help?' });

        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('returns 409 when attempt is in non-working status', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
          ...mockAttempt,
          status: 'completed',
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/mentor')
          .set('Authorization', 'Bearer test-token')
          .send({ message: 'Can you help?' });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('ATTEMPT_NOT_IN_WORKING_STATE');
      });

      it('returns 409 when mission is in transfer mode', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
        vi.spyOn(database, 'getVariantHintData').mockResolvedValueOnce({
          ...mockVariantData,
          mode: 'transfer',
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/mentor')
          .set('Authorization', 'Bearer test-token')
          .send({ message: 'What is the approach?' });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('AI_MENTOR_NOT_ALLOWED_IN_TRANSFER');
      });

      it('returns Socratic grounded reply and preserves conversationId', async () => {
        vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
        vi.spyOn(database, 'getVariantHintData').mockResolvedValueOnce(mockVariantData);
        vi.spyOn(database, 'recordAiCall').mockResolvedValueOnce({
          id: 'ai-call-1',
          attempt_id: mockAttempt.id,
          purpose: 'mentor',
          model: 'claude-3-5-sonnet-20241022',
          prompt_name: 'mentor',
          prompt_version: 'v1',
          input_tokens: 250,
          output_tokens: 80,
          latency_ms: 30,
          cost_usd: 0.002,
          created_at: new Date(),
        });

        const response = await request(app)
          .post('/v1/attempts/att-hint-1/mentor')
          .set('Authorization', 'Bearer test-token')
          .send({
            message: 'Where is the race condition in the inventory update?',
            conversationId: 'c8d62634-1111-4567-89ab-cdef01234567',
          });

        expect(response.status).toBe(200);
        expect(response.body.conversationId).toBe('c8d62634-1111-4567-89ab-cdef01234567');
        expect(response.body.reply).toContain('Consider this system behavior');
        expect(response.body.groundedOn.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Transfer Verification Mission Endpoints', () => {
    const mockAttempt = {
      id: 'att-transfer-test',
      session_id: 'sess-transfer-1',
      learner_id: 'learner_test-token',
      variant_id: 'var-practice-1',
      status: 'evaluated' as const,
      selector_decision: {},
      hints_used: 1,
      submissions_count: 1,
      created_at: new Date(),
    };

    const mockTransferVariantDetails = {
      id: 'var-transfer-101',
      variantId: 'var-transfer-101',
      templateId: 'tpl-concurrency-1',
      title: 'Transfer: Payment Gateway Concurrency Defense',
      narrative: 'A high-throughput payment webhook is experiencing double-processing bugs.',
      instructions:
        'Fix the webhook handler to guarantee idempotency and avoid duplicate transactions.',
      mode: 'transfer' as const,
      difficulty: 3,
      skillIds: ['skill-concurrency'],
      estimatedMinutes: 20,
      factSheet: 'Webhooks can be re-delivered. Database idempotency keys prevent double charge.',
      referenceSystem: {
        name: 'Shopverse',
        dockerImage: 'shopverse:latest',
      },
    };

    it('POST /v1/attempts/:id/transfer rejects unauthenticated requests with 401', async () => {
      const response = await request(app).post('/v1/attempts/att-transfer-test/transfer');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /v1/attempts/:id/transfer returns 404 when attempt not found', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/attempts/att-nonexistent/transfer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
    });

    it('POST /v1/attempts/:id/transfer returns 403 when attempt belongs to another learner', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        ...mockAttempt,
        learner_id: 'other-learner',
      });

      const response = await request(app)
        .post('/v1/attempts/att-transfer-test/transfer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('POST /v1/attempts/:id/transfer returns 409 when attempt is in working state', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        ...mockAttempt,
        status: 'working',
      });

      const response = await request(app)
        .post('/v1/attempts/att-transfer-test/transfer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('INVALID_STATE_FOR_TRANSFER');
    });

    it('POST /v1/attempts/:id/transfer returns 409 when attempt is completed', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        ...mockAttempt,
        status: 'completed',
      });

      const response = await request(app)
        .post('/v1/attempts/att-transfer-test/transfer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('INVALID_STATE_FOR_TRANSFER');
    });

    it('POST /v1/attempts/:id/transfer transitions evaluated attempt to transfer and returns task details', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(mockAttempt);
      vi.spyOn(database, 'findTransferVariantForVariant').mockResolvedValueOnce(
        mockTransferVariantDetails
      );
      const transitionSpy = vi
        .spyOn(database, 'transitionAttemptToTransfer')
        .mockResolvedValueOnce({
          ...mockAttempt,
          status: 'transfer',
          variant_id: mockTransferVariantDetails.id,
        });

      const response = await request(app)
        .post('/v1/attempts/att-transfer-test/transfer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('transfer');
      expect(response.body.transferTask).toEqual({
        id: 'var-transfer-101',
        variantId: 'var-transfer-101',
        title: 'Transfer: Payment Gateway Concurrency Defense',
        instructions:
          'Fix the webhook handler to guarantee idempotency and avoid duplicate transactions.',
        factSheet: 'Webhooks can be re-delivered. Database idempotency keys prevent double charge.',
        mode: 'transfer',
        difficulty: 3,
        aiMentorAvailable: false,
        hintsAvailable: false,
      });
      expect(transitionSpy).toHaveBeenCalledWith('att-transfer-test', 'var-transfer-101');
    });

    it('POST /v1/attempts/:id/transfer allows transitions from viva status', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        ...mockAttempt,
        status: 'viva',
      });
      vi.spyOn(database, 'findTransferVariantForVariant').mockResolvedValueOnce(
        mockTransferVariantDetails
      );
      vi.spyOn(database, 'transitionAttemptToTransfer').mockResolvedValueOnce({
        ...mockAttempt,
        status: 'transfer',
        variant_id: mockTransferVariantDetails.id,
      });

      const response = await request(app)
        .post('/v1/attempts/att-transfer-test/transfer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('transfer');
    });

    it('POST /v1/attempts/:id/submissions accepts patch when attempt is in transfer state', async () => {
      const transferAttempt = {
        ...mockAttempt,
        id: 'att-transfer-sub',
        status: 'transfer' as const,
        variant_id: 'var-transfer-101',
      };

      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(transferAttempt);
      vi.spyOn(database, 'createSubmission').mockResolvedValueOnce({
        id: 'sub-transfer-99',
        attempt_id: transferAttempt.id,
        learner_id: transferAttempt.learner_id,
        patch: `--- a/service.ts\n+++ b/service.ts\n@@ -1,2 +1,3 @@\n+const idempotent = true;\n`,
        structured_answers: {},
        client_checksum: 'chk-1',
        status: 'queued',
        submitted_at: new Date(),
      });

      const validPatch = `--- a/service.ts\n+++ b/service.ts\n@@ -1,2 +1,3 @@\n+const idempotent = true;\n`;

      const response = await request(app)
        .post(`/v1/attempts/${transferAttempt.id}/submissions`)
        .set('Authorization', 'Bearer test-token')
        .send({
          patch: validPatch,
          clientChecksum: 'chk-1',
        });

      expect(response.status).toBe(202);
      expect(response.body.status).toBe('queued');
      expect(response.body.submissionId).toBe('sub-transfer-99');
      expect(response.body.pollingUrl).toBe('/v1/submissions/sub-transfer-99');
    });
  });

  describe('/v1/onboarding Endpoint', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const response = await request(app)
        .post('/v1/onboarding')
        .send({
          goal: 'get-a-job',
          currentRole: 'student',
          yearsExperience: 1,
          targetStack: ['node', 'typescript'],
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('validates onboarding input payload with 400', async () => {
      const response = await request(app)
        .post('/v1/onboarding')
        .set('Authorization', 'Bearer test-token')
        .send({
          goal: 'invalid-goal',
          currentRole: 'student',
          yearsExperience: -5,
          targetStack: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 if learner is already onboarded', async () => {
      vi.spyOn(database, 'getLearnerById').mockResolvedValueOnce({
        id: 'learner_test-token',
        email: 'test@example.com',
        display_name: 'Test Learner',
        goal: 'get-a-job',
        current_role: 'student',
        years_experience: 1,
        target_stack: ['node'],
        onboarded_at: new Date(),
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/onboarding')
        .set('Authorization', 'Bearer test-token')
        .send({
          goal: 'get-a-job',
          currentRole: 'student',
          yearsExperience: 1,
          targetStack: ['node', 'typescript'],
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('ALREADY_ONBOARDED');
    });

    it('completes onboarding, creates diagnostic session, and returns 201', async () => {
      vi.spyOn(database, 'getLearnerById').mockResolvedValueOnce(null);
      vi.spyOn(database, 'completeLearnerOnboarding').mockResolvedValueOnce({
        id: 'learner_test-token',
        email: 'test@example.com',
        display_name: 'Test Learner',
        goal: 'get-a-job',
        current_role: 'student',
        years_experience: 1,
        target_stack: ['node', 'typescript'],
        onboarded_at: new Date(),
        created_at: new Date(),
      });
      vi.spyOn(database, 'createSession').mockResolvedValueOnce({
        id: 'ses-diag-101',
        learner_id: 'learner_test-token',
        mode: 'practice',
        started_at: new Date(),
        ended_at: null,
      });

      const response = await request(app)
        .post('/v1/onboarding')
        .set('Authorization', 'Bearer test-token')
        .send({
          goal: 'get-a-job',
          currentRole: 'student',
          yearsExperience: 1,
          targetStack: ['node', 'typescript', 'postgresql'],
        });

      expect(response.status).toBe(201);
      expect(response.body.learnerId).toBe('learner_test-token');
      expect(response.body.diagnosticSessionId).toBe('ses-diag-101');
      expect(response.body.nextStep).toBe('diagnostic');
    });
  });

  describe('/v1/diagnostic Endpoint', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const response = await request(app)
        .post('/v1/diagnostic')
        .send({
          diagnosticSessionId: 'ses-1',
          answers: [{ questionId: 'q-1', answer: 'a' }],
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('validates empty answers with 400', async () => {
      const response = await request(app)
        .post('/v1/diagnostic')
        .set('Authorization', 'Bearer test-token')
        .send({
          diagnosticSessionId: 'ses-1',
          answers: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when diagnostic session is not found', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/diagnostic')
        .set('Authorization', 'Bearer test-token')
        .send({
          diagnosticSessionId: 'non-existent-session',
          answers: [{ questionId: 'q-1', answer: 'a' }],
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('DIAGNOSTIC_SESSION_NOT_FOUND');
    });

    it('returns 403 when session belongs to another learner', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce({
        id: 'ses-other-user',
        learner_id: 'learner_different',
        mode: 'practice',
        started_at: new Date(),
        ended_at: null,
      });

      const response = await request(app)
        .post('/v1/diagnostic')
        .set('Authorization', 'Bearer test-token')
        .send({
          diagnosticSessionId: 'ses-other-user',
          answers: [{ questionId: 'q-1', answer: 'a' }],
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 409 when diagnostic session is already completed', async () => {
      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce({
        id: 'ses-already-done',
        learner_id: 'learner_test-token',
        mode: 'practice',
        started_at: new Date(),
        ended_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/diagnostic')
        .set('Authorization', 'Bearer test-token')
        .send({
          diagnosticSessionId: 'ses-already-done',
          answers: [{ questionId: 'q-1', answer: 'a' }],
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DIAGNOSTIC_ALREADY_COMPLETE');
    });

    it('scores answers, updates Bayesian skill profile, and generates next task session', async () => {
      const mockSession = {
        id: 'ses-diag-ready',
        learner_id: 'learner_test-token',
        mode: 'practice' as const,
        started_at: new Date(),
        ended_at: null,
      };

      const mockSkill = {
        id: 'skill-sql-isolation',
        slug: 'sql-isolation',
        name: 'Database Transaction Isolation',
        description: '',
        track: 'backend',
        status: 'active' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.spyOn(database, 'getSessionById').mockResolvedValueOnce(mockSession);
      vi.spyOn(database, 'getAllActiveSkills').mockResolvedValueOnce([mockSkill]);
      vi.spyOn(database, 'recordEvidenceEvent').mockResolvedValueOnce({
        id: 'evi-diag-1',
        learner_id: mockSession.learner_id,
        attempt_id: mockSession.id,
        skill_id: mockSkill.id,
        evidence_type: 'diagnostic',
        passed: true,
        score: 1.0,
        difficulty: 2,
        task_mode: 'debug',
        occurred_at: new Date(),
      });
      vi.spyOn(database, 'getSkillState').mockResolvedValueOnce(null);
      vi.spyOn(database, 'upsertSkillState').mockResolvedValueOnce({
        id: 'state-1',
        learner_id: mockSession.learner_id,
        skill_id: mockSkill.id,
        mastery: 0.28,
        alpha: 1.27,
        beta: 3.0,
        evidence_count: 1,
        last_evidence_at: new Date(),
        updated_at: new Date(),
      });
      vi.spyOn(database, 'endSession').mockResolvedValueOnce({
        ...mockSession,
        ended_at: new Date(),
      });
      vi.spyOn(database, 'createSession').mockResolvedValueOnce({
        id: 'ses-practice-next',
        learner_id: mockSession.learner_id,
        mode: 'practice',
        started_at: new Date(),
        ended_at: null,
      });

      const response = await request(app)
        .post('/v1/diagnostic')
        .set('Authorization', 'Bearer test-token')
        .send({
          diagnosticSessionId: mockSession.id,
          answers: [{ questionId: 'q-tx-iso', answer: 'SERIALIZABLE prevents phantom reads' }],
        });

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBe('ses-practice-next');
      expect(response.body.nextStep).toBe('task');
      expect(response.body.skillProfile).toHaveLength(1);
      expect(response.body.skillProfile[0].skillId).toBe(mockSkill.id);
      expect(response.body.skillProfile[0].skillName).toBe(mockSkill.name);
      expect(response.body.skillProfile[0].masteryEstimate).toBeGreaterThan(0.2);
      expect(response.body.skillProfile[0].confidence).toBe('low');
    });
  });

  describe('/v1/profile Endpoints', () => {
    it('GET /v1/profile/skills rejects unauthenticated requests with 401', async () => {
      const response = await request(app).get('/v1/profile/skills');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /v1/profile/skills returns skills with mastery and confidence levels', async () => {
      vi.spyOn(database, 'getSkillsWithMasteryForLearner').mockResolvedValueOnce([
        {
          skill_id: 'skill-1',
          skill_name: 'Database Concurrency',
          mastery: 0.65,
          alpha: 4.5,
          beta: 2.4,
          evidence_count: 5,
          last_evidence_at: new Date('2026-10-09T12:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/v1/profile/skills')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.skills).toHaveLength(1);
      expect(response.body.skills[0].skillId).toBe('skill-1');
      expect(response.body.skills[0].skillName).toBe('Database Concurrency');
      expect(response.body.skills[0].mastery).toBe(0.65);
      expect(response.body.skills[0].confidence).toBe('medium');
      expect(response.body.skills[0].attemptsCount).toBe(5);
      expect(response.body.skills[0].lastAttemptAt).toBe('2026-10-09T12:00:00.000Z');
    });

    it('GET /v1/profile/skills/:skillId/evidence returns evidence history', async () => {
      vi.spyOn(database, 'getEvidenceEventsForSkill').mockResolvedValueOnce([
        {
          id: 'evi-1',
          learner_id: 'learner_test-token',
          attempt_id: 'att-1',
          skill_id: 'skill-1',
          evidence_type: 'practice',
          passed: true,
          score: 1.0,
          difficulty: 3,
          task_mode: 'debug',
          occurred_at: new Date('2026-10-09T12:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/v1/profile/skills/skill-1/evidence')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.skillId).toBe('skill-1');
      expect(response.body.evidence).toHaveLength(1);
      expect(response.body.evidence[0].id).toBe('evi-1');
      expect(response.body.evidence[0].evidenceType).toBe('practice');
      expect(response.body.evidence[0].passed).toBe(true);
      expect(response.body.evidence[0].score).toBe(1.0);
    });
  });

  describe('/v1/flags Endpoint', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const response = await request(app).post('/v1/flags').send({
        attemptId: 'att-1',
        type: 'incorrect-test',
        description: 'Test is wrong',
      });
      expect(response.status).toBe(401);
    });

    it('returns 400 for invalid payload or unknown flag type', async () => {
      const response = await request(app)
        .post('/v1/flags')
        .set('Authorization', 'Bearer test-token')
        .send({
          attemptId: 'att-1',
          type: 'invalid-type-xyz',
          description: '',
        });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 if attempt is not found', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/flags')
        .set('Authorization', 'Bearer test-token')
        .send({
          attemptId: 'att-missing',
          type: 'unclear-instructions',
          description: 'Instructions are vague',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
    });

    it('returns 403 if attempt belongs to another learner', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-1',
        session_id: 'ses-1',
        learner_id: 'learner-other-user',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/flags')
        .set('Authorization', 'Bearer test-token')
        .send({
          attemptId: 'att-1',
          type: 'unclear-instructions',
          description: 'Step 2 unclear',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('creates problem flag and returns 201 with flagId and open status', async () => {
      vi.spyOn(database, 'getAttemptById').mockResolvedValueOnce({
        id: 'att-1',
        session_id: 'ses-1',
        learner_id: 'learner_test-token',
        variant_id: 'var-1',
        status: 'working',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 0,
        created_at: new Date(),
      });
      vi.spyOn(database, 'createFlag').mockResolvedValueOnce({
        id: 'flag-999',
        attempt_id: 'att-1',
        learner_id: 'learner_test-token',
        type: 'incorrect-test',
        description: 'Test assertion fails incorrectly',
        status: 'open',
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/flags')
        .set('Authorization', 'Bearer test-token')
        .send({
          attemptId: 'att-1',
          type: 'incorrect-test',
          description: 'Test assertion fails incorrectly',
        });

      expect(response.status).toBe(201);
      expect(response.body.flagId).toBe('flag-999');
      expect(response.body.status).toBe('open');
    });
  });

  describe('/v1/evaluations/:id/disputes Endpoint', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const response = await request(app).post('/v1/evaluations/eval-1/disputes').send({
        reason: 'Network timeout',
        evidenceDescription: 'Evaluation failed due to container timeout',
      });
      expect(response.status).toBe(401);
    });

    it('returns 400 for empty reason or evidence description', async () => {
      const response = await request(app)
        .post('/v1/evaluations/eval-1/disputes')
        .set('Authorization', 'Bearer test-token')
        .send({
          reason: '',
          evidenceDescription: ' ',
        });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 if evaluation does not exist', async () => {
      vi.spyOn(database, 'getEvaluationDetails').mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/evaluations/eval-missing/disputes')
        .set('Authorization', 'Bearer test-token')
        .send({
          reason: 'Timeout error',
          evidenceDescription: 'Container killed',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('EVALUATION_NOT_FOUND');
    });

    it('returns 403 if evaluation belongs to a different learner', async () => {
      vi.spyOn(database, 'getEvaluationDetails').mockResolvedValueOnce({
        id: 'eval-1',
        attempt_id: 'att-1',
        learner_id: 'learner-different',
        passed: false,
        score: 0.0,
      });

      const response = await request(app)
        .post('/v1/evaluations/eval-1/disputes')
        .set('Authorization', 'Bearer test-token')
        .send({
          reason: 'Unfair grading',
          evidenceDescription: 'My solution was correct',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 409 if dispute already exists for this evaluation', async () => {
      vi.spyOn(database, 'getEvaluationDetails').mockResolvedValueOnce({
        id: 'eval-1',
        attempt_id: 'att-1',
        learner_id: 'learner_test-token',
        passed: false,
        score: 0.0,
      });
      vi.spyOn(database, 'getDisputeByEvaluationId').mockResolvedValueOnce({
        id: 'disp-existing',
        evaluation_id: 'eval-1',
        learner_id: 'learner_test-token',
        reason: 'Already filed',
        evidence_description: 'Previous dispute details',
        status: 'open',
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/evaluations/eval-1/disputes')
        .set('Authorization', 'Bearer test-token')
        .send({
          reason: 'Double dispute',
          evidenceDescription: 'Trying again',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DISPUTE_ALREADY_EXISTS');
    });

    it('creates dispute and returns 201 with disputeId and open status', async () => {
      vi.spyOn(database, 'getEvaluationDetails').mockResolvedValueOnce({
        id: 'eval-1',
        attempt_id: 'att-1',
        learner_id: 'learner_test-token',
        passed: false,
        score: 0.5,
      });
      vi.spyOn(database, 'getDisputeByEvaluationId').mockResolvedValueOnce(null);
      vi.spyOn(database, 'createDispute').mockResolvedValueOnce({
        id: 'disp-new-1',
        evaluation_id: 'eval-1',
        learner_id: 'learner_test-token',
        reason: 'Hidden test edge case was overly restrictive',
        evidence_description: 'Passed 4/5 tests with standard transaction isolation',
        status: 'open',
        created_at: new Date(),
      });

      const response = await request(app)
        .post('/v1/evaluations/eval-1/disputes')
        .set('Authorization', 'Bearer test-token')
        .send({
          reason: 'Hidden test edge case was overly restrictive',
          evidenceDescription: 'Passed 4/5 tests with standard transaction isolation',
        });

      expect(response.status).toBe(201);
      expect(response.body.disputeId).toBe('disp-new-1');
      expect(response.body.status).toBe('open');
    });
  });

  describe('/v1/progress/weekly Endpoint', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const response = await request(app).get('/v1/progress/weekly');
      expect(response.status).toBe(401);
    });

    it('returns 200 with weekly progress report', async () => {
      vi.spyOn(database, 'computeWeeklyProgressSnapshot').mockResolvedValueOnce({
        weekOf: '2026-10-05',
        summary: 'Completed 5 mission attempt(s) this week with 1 transfer verification(s) passed.',
        skillsImproved: ['Database Concurrency & Locking'],
        attemptsCompleted: 5,
        transferTasksPassed: 1,
        masteryChanges: [
          {
            skillId: '22222222-2222-2222-2222-222222220002',
            skillName: 'Database Concurrency & Locking',
            delta: 0.16,
          },
        ],
      });

      const response = await request(app)
        .get('/v1/progress/weekly')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.weekOf).toBe('2026-10-05');
      expect(response.body.attemptsCompleted).toBe(5);
      expect(response.body.transferTasksPassed).toBe(1);
      expect(response.body.skillsImproved).toContain('Database Concurrency & Locking');
      expect(response.body.masteryChanges[0].delta).toBe(0.16);
      expect(response.body.summary).toContain('Completed 5 mission attempt(s)');
    });
  });
});
