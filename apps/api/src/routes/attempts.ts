import { Router, Request, Response } from 'express';
import { getAttemptById } from '@engineering-simulator/database';

export const attemptRouter = Router();

attemptRouter.get('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const learnerId = req.learnerId;

  try {
    const attempt = await getAttemptById(id);

    if (!attempt) {
      return res.status(404).json({
        error: {
          code: 'ATTEMPT_NOT_FOUND',
          message: 'Attempt not found or not accessible.',
          details: {},
        },
      });
    }

    if (learnerId && attempt.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to view this attempt.',
          details: {},
        },
      });
    }

    res.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        variantId: attempt.variant_id,
        sessionId: attempt.session_id,
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
        hintsUsed: attempt.hints_used,
        submissionsCount: attempt.submissions_count,
      },
    });
  } catch (err: unknown) {
    console.error('Fetch attempt error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not fetch attempt',
        details: {},
      },
    });
  }
});
