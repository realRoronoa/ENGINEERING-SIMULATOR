import { describe, it, expect } from 'vitest';
import { buildApp } from './app.js';

describe('API Server', () => {
  it('GET /health should return 200 OK with valid health status', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.status).toBe('ok');
    expect(payload.version).toBe('0.0.1');
    expect(typeof payload.timestamp).toBe('string');

    await app.close();
  });
});
