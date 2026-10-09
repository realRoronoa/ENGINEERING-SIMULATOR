import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getSessionById,
  endSession,
  createSession,
  getAllActiveSkills,
  recordEvidenceEvent,
  getSkillState,
  upsertSkillState,
} from '@engineering-simulator/database';
import {
  updateSkillState,
  calculateConfidence,
  INITIAL_ALPHA,
  INITIAL_BETA,
} from '@engineering-simulator/learner-model';
import type { DiagnosticResponse, SkillProfileEstimate } from '@engineering-simulator/contracts';

export const diagnosticRouter = Router();

const diagnosticSchema = z.object({
  diagnosticSessionId: z.string().min(1, 'diagnosticSessionId is required'),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, 'questionId is required'),
        answer: z.union([z.string(), z.array(z.string())]),
      })
    )
    .min(1, 'answers array must contain at least one question answer'),
});

diagnosticRouter.post('/', async (req: Request, res: Response) => {
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required for diagnostic assessment.',
        details: {},
      },
    });
  }

  const parsed = diagnosticSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid diagnostic submission payload.',
        details: parsed.error.format(),
      },
    });
  }

  const { diagnosticSessionId, answers } = parsed.data;

  try {
    const session = await getSessionById(diagnosticSessionId);

    if (!session) {
      return res.status(404).json({
        error: {
          code: 'DIAGNOSTIC_SESSION_NOT_FOUND',
          message: 'Diagnostic session not found.',
          details: {},
        },
      });
    }

    if (session.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to submit answers for this session.',
          details: {},
        },
      });
    }

    if (session.ended_at) {
      return res.status(409).json({
        error: {
          code: 'DIAGNOSTIC_ALREADY_COMPLETE',
          message: 'Diagnostic session has already been completed.',
          details: {},
        },
      });
    }

    // Retrieve active skills to evaluate diagnostic results against
    const activeSkills = await getAllActiveSkills();
    const skillProfile: SkillProfileEstimate[] = [];

    // Fallback skill list if database active skills is empty
    const targetSkills =
      activeSkills.length > 0
        ? activeSkills
        : [
            {
              id: 'skill-core-debugging',
              slug: 'core-debugging',
              name: 'Root Cause Isolation',
              description: '',
              track: 'backend',
              status: 'active' as const,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

    // Process diagnostic answers and map evidence to skills
    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      const targetSkill = targetSkills[i % targetSkills.length];

      // Simple scoring: non-empty string or array indicates valid diagnostic submission
      const isNonEmpty = Array.isArray(ans.answer)
        ? ans.answer.length > 0
        : ans.answer.trim().length > 0;
      const passed = isNonEmpty;
      const score = passed ? 1.0 : 0.0;

      // 1. Record evidence event
      await recordEvidenceEvent({
        learnerId,
        attemptId: session.id,
        skillId: targetSkill.id,
        evidenceType: 'diagnostic',
        passed,
        score,
        difficulty: 2,
        taskMode: 'debug',
      });

      // 2. Fetch or initialize skill state
      const existingState = await getSkillState(learnerId, targetSkill.id);
      const currentState = existingState
        ? {
            alpha: existingState.alpha,
            beta: existingState.beta,
            evidenceCount: existingState.evidence_count,
          }
        : {
            alpha: INITIAL_ALPHA,
            beta: INITIAL_BETA,
            evidenceCount: 0,
          };

      // 3. Bayesian Beta update
      const updated = updateSkillState(currentState, {
        learnerId,
        attemptId: session.id,
        skillId: targetSkill.id,
        evidenceType: 'diagnostic',
        passed,
        score,
        difficulty: 2,
        taskMode: 'debug',
      });

      // 4. Upsert skill state
      await upsertSkillState(learnerId, targetSkill.id, {
        alpha: updated.alpha,
        beta: updated.beta,
        mastery: updated.mastery,
        evidenceCount: updated.evidenceCount,
        lastEvidenceAt: new Date(),
      });

      skillProfile.push({
        skillId: targetSkill.id,
        skillName: targetSkill.name,
        masteryEstimate: updated.mastery,
        confidence: calculateConfidence(updated.alpha, updated.beta),
      });
    }

    // Mark diagnostic session as completed
    await endSession(session.id);

    // Create the first learning session (ready for /v1/sessions/:id/next)
    const nextSession = await createSession(learnerId, 'practice');

    const response: DiagnosticResponse = {
      skillProfile,
      sessionId: nextSession.id,
      nextStep: 'task',
    };

    res.json(response);
  } catch (err: unknown) {
    console.error('Diagnostic error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not process diagnostic assessment.',
        details: {},
      },
    });
  }
});
