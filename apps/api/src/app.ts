import express, { Express, Request, Response } from 'express';
import { z } from 'zod';
import type { HealthResponse } from '@engineering-simulator/contracts';
import { query } from '@engineering-simulator/database';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sessionRouter } from './routes/sessions.js';
import { attemptRouter } from './routes/attempts.js';
import { submissionRouter } from './routes/submissions.js';

export const healthSchema = z.object({
  status: z.enum(['ok', 'error']),
  version: z.string(),
  timestamp: z.string(),
});

export function buildApp(): Express {
  const app = express();

  app.use(express.json());

  // Public Liveness Check
  app.get('/health', (_req: Request, res: Response) => {
    const response: HealthResponse = {
      status: 'ok',
      version: '0.0.1',
      timestamp: new Date().toISOString(),
    };

    healthSchema.parse(response);
    res.json(response);
  });

  // Public Readiness Probe (Database connectivity verification)
  app.get('/health/ready', async (_req: Request, res: Response) => {
    try {
      await query('SELECT 1');
      res.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // API v1 Routes
  app.use('/v1/sessions', authMiddleware, sessionRouter);
  app.use('/v1/attempts', authMiddleware, attemptRouter);
  app.use('/v1/submissions', authMiddleware, submissionRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
