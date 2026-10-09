import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/api/app.js';

describe('Shopverse API Suite', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('should return service health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('shopverse');
      expect(typeof res.body.timestamp).toBe('string');
    });
  });

  describe('Input Validation & Edge Cases', () => {
    it('POST /users/register should reject missing credentials', async () => {
      const res = await request(app).post('/users/register').send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('POST /orders/checkout should reject empty or invalid items', async () => {
      const res = await request(app).post('/orders/checkout').send({ userId: 1, items: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('non-empty items array');
    });

    it('GET /products/:id should reject non-numeric product ID', async () => {
      const res = await request(app).get('/products/not-a-number');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid product ID');
    });

    it('GET /orders/:id should reject non-numeric order ID', async () => {
      const res = await request(app).get('/orders/abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid order ID');
    });
  });
});
