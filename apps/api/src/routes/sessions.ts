import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createSession } from '@engineering-simulator/database';

export const sessionRouter = Router();

const createSessionSchema = z.object({
  mode: z.enum(['practice', 'debug', 'build', 'transfer']),
});

sessionRouter.post('/', async (req: Request, res: Response) => {
  const parseResult = createSessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid session mode. Must be one of practice, debug, build, transfer.',
        details: parseResult.error.flatten(),
      },
    });
  }

  const learnerId = req.learnerId || 'anonymous-learner';

  try {
    const session = await createSession(learnerId, parseResult.data.mode);
    res.status(201).json({
      sessionId: session.id,
      createdAt: session.started_at,
    });
  } catch (err: unknown) {
    console.error('Session creation error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not create session in database',
        details: {},
      },
    });
  }
});
