import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  createSession,
  getSessionById,
  getActiveAttemptForSession,
  createAttempt,
  getVariantWithDetails,
  fetchSelectionContext,
} from '@engineering-simulator/database';
import { selectNextTask } from '@engineering-simulator/selector';

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

sessionRouter.post('/:id/next', async (req: Request, res: Response) => {
  const sessionId = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to select next task.',
        details: {},
      },
    });
  }

  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found.',
          details: {},
        },
      });
    }

    if (session.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to access this session.',
          details: {},
        },
      });
    }

    // Check if session already has an active attempt
    const activeAttempt = await getActiveAttemptForSession(sessionId);
    if (activeAttempt) {
      return res.status(409).json({
        error: {
          code: 'SESSION_HAS_ACTIVE_ATTEMPT',
          message: 'Session already has an active attempt in progress.',
          details: { activeAttemptId: activeAttempt.id },
        },
      });
    }

    // Fetch selection context (mastery, recency, active misconceptions, variants, skills)
    const context = await fetchSelectionContext(learnerId);

    // Call Selector engine
    let decision;
    try {
      decision = selectNextTask({
        learnerId,
        currentMastery: context.currentMastery,
        recentVariantIds: context.recentVariantIds,
        activeMisconceptions: context.activeMisconceptions,
        availableSkills: context.availableSkills,
        availableVariants: context.availableVariants,
      });
    } catch (selectorErr: unknown) {
      return res.status(503).json({
        error: {
          code: 'NO_TASKS_AVAILABLE',
          message:
            selectorErr instanceof Error
              ? selectorErr.message
              : 'No published tasks available for selection.',
          details: {},
        },
      });
    }

    // Create attempt record with selector decision
    const attempt = await createAttempt(
      sessionId,
      learnerId,
      decision.variantId,
      decision as unknown as Record<string, unknown>
    );

    // Get variant metadata for learner briefing
    const variantDetails = await getVariantWithDetails(decision.variantId);

    res.status(201).json({
      attemptId: attempt.id,
      task: {
        id: variantDetails?.id || decision.variantId,
        variantId: decision.variantId,
        title: variantDetails?.title || 'System Debug Task',
        narrative: variantDetails?.narrative || 'Analyze and resolve the system anomaly.',
        instructions:
          variantDetails?.instructions || 'Run test suite, identify bug, and submit patch.',
        mode: decision.taskMode,
        difficulty: decision.difficulty,
        skillIds: variantDetails?.skillIds || [decision.skillId],
        estimatedMinutes: variantDetails?.estimatedMinutes || 30,
        factSheet: variantDetails?.factSheet || '',
        referenceSystem: {
          name: variantDetails?.referenceSystem.name || 'shopverse',
          dockerImage:
            variantDetails?.referenceSystem.dockerImage || 'engineering-simulator/shopverse:latest',
        },
      },
      selectorReason: decision.reason,
    });
  } catch (err: unknown) {
    console.error('Task selection error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not select next task',
        details: {},
      },
    });
  }
});
