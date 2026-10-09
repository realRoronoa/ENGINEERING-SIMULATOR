import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getLearnerById,
  completeLearnerOnboarding,
  createSession,
} from '@engineering-simulator/database';
import type { OnboardingResponse } from '@engineering-simulator/contracts';

export const onboardingRouter = Router();

const onboardingSchema = z.object({
  goal: z.enum(['get-a-job', 'improve-skills', 'interview-prep'], {
    errorMap: () => ({ message: 'goal must be one of get-a-job, improve-skills, interview-prep' }),
  }),
  currentRole: z.enum(['student', 'junior', 'mid', 'senior'], {
    errorMap: () => ({ message: 'currentRole must be one of student, junior, mid, senior' }),
  }),
  yearsExperience: z
    .number({ invalid_type_error: 'yearsExperience must be a number' })
    .int()
    .min(0, 'yearsExperience cannot be negative'),
  targetStack: z
    .array(z.string())
    .min(1, 'targetStack must contain at least one technology stack item'),
});

onboardingRouter.post('/', async (req: Request, res: Response) => {
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required for onboarding.',
        details: {},
      },
    });
  }

  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid onboarding payload.',
        details: parsed.error.format(),
      },
    });
  }

  try {
    const existingLearner = await getLearnerById(learnerId);
    if (existingLearner && existingLearner.onboarded_at) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_ONBOARDED',
          message: 'Learner profile is already onboarded.',
          details: {},
        },
      });
    }

    const email = `${learnerId}@engineering-simulator.local`;
    const displayName = `Learner ${learnerId.substring(0, 8)}`;

    const learner = await completeLearnerOnboarding(learnerId, email, displayName, parsed.data);

    // Create initial diagnostic session
    const diagnosticSession = await createSession(learner.id, 'practice');

    const response: OnboardingResponse = {
      learnerId: learner.id,
      diagnosticSessionId: diagnosticSession.id,
      nextStep: 'diagnostic',
    };

    res.status(201).json(response);
  } catch (err: unknown) {
    console.error('Onboarding error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not complete learner onboarding.',
        details: {},
      },
    });
  }
});
