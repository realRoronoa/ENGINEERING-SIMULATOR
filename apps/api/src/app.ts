import Fastify, { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { HealthResponse } from '@engineering-simulator/contracts';

export const healthSchema = z.object({
  status: z.enum(['ok', 'error']),
  version: z.string(),
  timestamp: z.string(),
});

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  app.get('/health', async (_request, _reply): Promise<HealthResponse> => {
    const response: HealthResponse = {
      status: 'ok',
      version: '0.0.1',
      timestamp: new Date().toISOString(),
    };

    healthSchema.parse(response);

    return response;
  });

  return app;
}
