import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getAttemptById,
  createSubmission,
  updateAttemptStatus,
  createVivaRecord,
  getVivaRecordById,
  addVivaAnswer,
  getVariantHintData,
  recordHintEvent,
} from '@engineering-simulator/database';
import { validatePatch } from '@engineering-simulator/evaluator';
import { enqueueGradingJob } from '@engineering-simulator/worker';
import { sendMentorMessage } from '@engineering-simulator/ai';

export const attemptRouter = Router();

const hintBodySchema = z.object({
  currentHintIndex: z.number().int().min(0, 'currentHintIndex must be greater than or equal to 0'),
});

const mentorBodySchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
  conversationId: z.string().optional().nullable(),
});

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

attemptRouter.post('/:id/hints', async (req: Request, res: Response) => {
  const attemptId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to request hints.',
        details: {},
      },
    });
  }

  const parseResult = hintBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid hint request payload.',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { currentHintIndex } = parseResult.data;

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
          message: 'You are not authorized to request hints for this attempt.',
          details: {},
        },
      });
    }

    if (['completed', 'abandoned', 'evaluated', 'viva'].includes(attempt.status)) {
      return res.status(409).json({
        error: {
          code: 'ATTEMPT_NOT_IN_WORKING_STATE',
          message: `Hints cannot be requested when attempt is in '${attempt.status}' state.`,
          details: { currentStatus: attempt.status },
        },
      });
    }

    const variantData = await getVariantHintData(attempt.variant_id);
    if (!variantData) {
      return res.status(404).json({
        error: {
          code: 'VARIANT_NOT_FOUND',
          message: 'Task variant not found for this attempt.',
          details: {},
        },
      });
    }

    if (variantData.mode === 'transfer' || attempt.status === 'transfer') {
      return res.status(409).json({
        error: {
          code: 'HINTS_NOT_ALLOWED_IN_TRANSFER',
          message: 'Hints are prohibited during transfer verification tasks.',
          details: {},
        },
      });
    }

    const ladder = variantData.hintLadder;
    if (ladder.length === 0 || currentHintIndex >= ladder.length) {
      return res.status(409).json({
        error: {
          code: 'ALL_HINTS_EXHAUSTED',
          message: 'All authored hints have been exhausted for this task variant.',
          details: { hintsAvailable: ladder.length, currentHintIndex },
        },
      });
    }

    const nextHint = ladder[currentHintIndex];
    const isLast = currentHintIndex + 1 >= ladder.length;

    await recordHintEvent(attemptId, learnerId, nextHint.index);

    res.json({
      hint: {
        index: nextHint.index,
        text: nextHint.text,
        type: 'authored' as const,
        isLast,
      },
    });
  } catch (err: unknown) {
    console.error('Hint request error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not retrieve hint',
        details: {},
      },
    });
  }
});

attemptRouter.post('/:id/mentor', async (req: Request, res: Response) => {
  const attemptId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to consult mentor.',
        details: {},
      },
    });
  }

  const parseResult = mentorBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid mentor request payload.',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { message, conversationId } = parseResult.data;

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
          message: 'You are not authorized to consult the mentor for this attempt.',
          details: {},
        },
      });
    }

    if (['completed', 'abandoned', 'evaluated', 'viva'].includes(attempt.status)) {
      return res.status(409).json({
        error: {
          code: 'ATTEMPT_NOT_IN_WORKING_STATE',
          message: `Mentor guidance is unavailable when attempt is in '${attempt.status}' state.`,
          details: { currentStatus: attempt.status },
        },
      });
    }

    const variantData = await getVariantHintData(attempt.variant_id);
    if (!variantData) {
      return res.status(404).json({
        error: {
          code: 'VARIANT_NOT_FOUND',
          message: 'Task variant not found for this attempt.',
          details: {},
        },
      });
    }

    if (variantData.mode === 'transfer' || attempt.status === 'transfer') {
      return res.status(409).json({
        error: {
          code: 'AI_MENTOR_NOT_ALLOWED_IN_TRANSFER',
          message: 'AI Mentor assistance is prohibited during transfer verification tasks.',
          details: {},
        },
      });
    }

    const mentorResponse = await sendMentorMessage({
      attemptId,
      learnerId,
      taskTitle: variantData.title,
      taskInstructions: variantData.instructions,
      taskMode: variantData.mode,
      factSheet: variantData.factSheet,
      message,
      conversationId: conversationId ?? null,
    });

    res.json({
      reply: mentorResponse.reply,
      conversationId: mentorResponse.conversationId,
      groundedOn: mentorResponse.groundedOn,
    });
  } catch (err: unknown) {
    console.error('Mentor consultation error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not process mentor message',
        details: {},
      },
    });
  }
});

const vivaAnswerBodySchema = z.object({
  vivaId: z.string().min(1, 'vivaId is required'),
  questionId: z.string().min(1, 'questionId is required'),
  answer: z.string().min(1, 'answer is required'),
});

attemptRouter.post('/:id/viva', async (req: Request, res: Response) => {
  const attemptId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to start viva oral defense.',
        details: {},
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
          message: 'You are not authorized to start viva for this attempt.',
          details: {},
        },
      });
    }

    if (attempt.status !== 'evaluated') {
      return res.status(409).json({
        error: {
          code: 'ATTEMPT_NOT_IN_EVALUATED_STATE',
          message: `Attempt must be in 'evaluated' state to begin viva oral defense. Current state: '${attempt.status}'.`,
          details: { currentStatus: attempt.status },
        },
      });
    }

    const authoredQuestions = [
      {
        id: 'viva-q-1',
        text: 'Can you explain the root cause of the fault and how your patch resolves it without breaking invariants?',
        type: 'authored' as const,
      },
      {
        id: 'viva-q-2',
        text: 'What error handling or concurrency edge cases did you consider while designing this fix?',
        type: 'authored' as const,
      },
    ];

    const vivaRecord = await createVivaRecord(attemptId, learnerId, authoredQuestions);
    await updateAttemptStatus(attemptId, 'viva');

    res.status(201).json({
      vivaId: vivaRecord.id,
      firstQuestion: vivaRecord.questions[0],
    });
  } catch (err: unknown) {
    console.error('Start viva error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not start viva session',
        details: {},
      },
    });
  }
});

attemptRouter.post('/:id/viva/answers', async (req: Request, res: Response) => {
  const attemptId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to submit viva answer.',
        details: {},
      },
    });
  }

  const parseResult = vivaAnswerBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid viva answer format.',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { vivaId, questionId, answer } = parseResult.data;

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
          message: 'You are not authorized to submit viva answers for this attempt.',
          details: {},
        },
      });
    }

    if (attempt.status !== 'viva') {
      return res.status(409).json({
        error: {
          code: 'VIVA_NOT_STARTED',
          message: `Viva oral defense is not currently active for this attempt. Current status: '${attempt.status}'.`,
          details: { currentStatus: attempt.status },
        },
      });
    }

    const viva = await getVivaRecordById(vivaId);
    if (!viva || viva.attempt_id !== attemptId) {
      return res.status(404).json({
        error: {
          code: 'VIVA_NOT_FOUND',
          message: 'Viva record not found for this attempt.',
          details: {},
        },
      });
    }

    const questions = Array.isArray(viva.questions) ? viva.questions : [];
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    const nextQuestion =
      currentIndex >= 0 && currentIndex + 1 < questions.length ? questions[currentIndex + 1] : null;

    const vivaComplete = nextQuestion === null;

    await addVivaAnswer(vivaId, questionId, answer, vivaComplete ? 'complete' : 'in-progress');

    if (vivaComplete) {
      await updateAttemptStatus(attemptId, 'completed');
    }

    res.json({
      nextQuestion,
      vivaComplete,
    });
  } catch (err: unknown) {
    console.error('Viva answer error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not record viva answer',
        details: {},
      },
    });
  }
});

attemptRouter.post('/:id/abandon', async (req: Request, res: Response) => {
  const attemptId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to abandon attempt.',
        details: {},
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
          message: 'You are not authorized to abandon this attempt.',
          details: {},
        },
      });
    }

    await updateAttemptStatus(attemptId, 'abandoned');

    res.json({
      attemptId,
      status: 'abandoned',
    });
  } catch (err: unknown) {
    console.error('Abandon attempt error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not abandon attempt',
        details: {},
      },
    });
  }
});
