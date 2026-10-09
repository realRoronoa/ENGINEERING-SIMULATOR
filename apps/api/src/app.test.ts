import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import * as database from '@engineering-simulator/database';
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
  });
});
