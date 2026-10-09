import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getEvaluationDetails,
  getDisputeByEvaluationId,
  createDispute,
} from '@engineering-simulator/database';

export const disputeRouter = Router();

const createDisputeSchema = z.object({
  reason: z.string().trim().min(1, 'reason is required'),
  evidenceDescription: z.string().trim().min(1, 'evidenceDescription is required'),
});

disputeRouter.post('/:id/disputes', async (req: Request, res: Response) => {
  const learnerId = req.learnerId;
  const evaluationId = String(req.params.id);

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        details: {},
      },
    });
  }

  const parseResult = createDisputeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid dispute payload',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { reason, evidenceDescription } = parseResult.data;

  try {
    const evaluation = await getEvaluationDetails(evaluationId);
    if (!evaluation) {
      return res.status(404).json({
        error: {
          code: 'EVALUATION_NOT_FOUND',
          message: 'Evaluation not found or does not exist',
          details: {},
        },
      });
    }

    if (evaluation.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only dispute evaluations for your own attempts',
          details: {},
        },
      });
    }

    const existing = await getDisputeByEvaluationId(evaluationId);
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'DISPUTE_ALREADY_EXISTS',
          message: 'A dispute has already been filed for this evaluation',
          details: { disputeId: existing.id, status: existing.status },
        },
      });
    }

    const dispute = await createDispute({
      evaluationId,
      learnerId,
      reason,
      evidenceDescription,
    });

    return res.status(201).json({
      disputeId: dispute.id,
      status: 'open',
    });
  } catch (err: unknown) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create dispute',
        details: {},
      },
    });
  }
});
