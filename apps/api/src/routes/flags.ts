import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAttemptById, createFlag } from '@engineering-simulator/database';
import type { FlagType } from '@engineering-simulator/contracts';

export const flagRouter = Router();

const createFlagSchema = z.object({
  attemptId: z.string().min(1, 'attemptId is required'),
  type: z.enum(['incorrect-test', 'unclear-instructions', 'wrong-answer', 'other']),
  description: z.string().trim().min(1, 'description is required'),
});

flagRouter.post('/', async (req: Request, res: Response) => {
  const learnerId = req.learnerId;
  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        details: {},
      },
    });
  }

  const parseResult = createFlagSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid flag payload',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { attemptId, type, description } = parseResult.data;

  try {
    const attempt = await getAttemptById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        error: {
          code: 'ATTEMPT_NOT_FOUND',
          message: 'Attempt not found or does not exist',
          details: {},
        },
      });
    }

    if (attempt.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only report flags on your own attempts',
          details: {},
        },
      });
    }

    const flag = await createFlag({
      attemptId,
      learnerId,
      type: type as FlagType,
      description,
    });

    return res.status(201).json({
      flagId: flag.id,
      status: 'open',
    });
  } catch (err: unknown) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create problem flag',
        details: {},
      },
    });
  }
});
