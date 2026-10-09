import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAttemptById, createSubmission } from '@engineering-simulator/database';
import { validatePatch } from '@engineering-simulator/evaluator';
import { enqueueGradingJob } from '@engineering-simulator/worker';

export const attemptRouter = Router();

const submissionBodySchema = z.object({
  patch: z.string().min(1, 'Patch content is required'),
  structuredAnswers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  clientChecksum: z.string().optional(),
});

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

attemptRouter.post('/:id/submissions', async (req: Request, res: Response) => {
  const attemptId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to submit patch.',
        details: {},
      },
    });
  }

  const parseResult = submissionBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid submission payload format.',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { patch, structuredAnswers, clientChecksum = '' } = parseResult.data;

  // Validate unified diff syntax & security constraints
  const patchResult = validatePatch(patch);
  if (!patchResult.valid) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PATCH',
        message: `Patch validation failed: ${patchResult.errors.join('; ')}`,
        details: { errors: patchResult.errors },
      },
    });
  }

  try {
    const attempt = await getAttemptById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        error: {
          code: 'ATTEMPT_NOT_FOUND',
          message: 'Attempt not found.',
          details: {},
        },
      });
    }

    if (attempt.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to submit for this attempt.',
          details: {},
        },
      });
    }

    // Check if attempt is in an active working state
    const nonWorkingStates = ['completed', 'abandoned', 'evaluated', 'viva'];
    if (nonWorkingStates.includes(attempt.status)) {
      return res.status(409).json({
        error: {
          code: 'ATTEMPT_NOT_IN_WORKING_STATE',
          message: `Cannot submit patch for attempt currently in '${attempt.status}' state.`,
          details: { currentStatus: attempt.status },
        },
      });
    }

    // Map structured answers
    const answersMap: Record<string, string> = {};
    if (structuredAnswers) {
      for (const ans of structuredAnswers) {
        answersMap[ans.questionId] = ans.answer;
      }
    }

    const submission = await createSubmission(
      attemptId,
      learnerId,
      patch,
      answersMap,
      clientChecksum
    );

    // Enqueue grading job to async worker pipeline
    enqueueGradingJob({
      submissionId: submission.id,
      attemptId,
      learnerId,
      variantId: attempt.variant_id,
      patch,
      structuredAnswers: answersMap,
      persistToDb: true,
    });

    res.status(202).json({
      submissionId: submission.id,
      status: 'queued',
      pollingUrl: `/v1/submissions/${submission.id}`,
    });
  } catch (err: unknown) {
    console.error('Submission error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not create submission',
        details: {},
      },
    });
  }
});
