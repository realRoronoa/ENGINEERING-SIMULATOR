import { Router, Request, Response } from 'express';
import { computeWeeklyProgressSnapshot } from '@engineering-simulator/database';

export const progressRouter = Router();

progressRouter.get('/weekly', async (req: Request, res: Response) => {
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

  try {
    const report = await computeWeeklyProgressSnapshot(learnerId);
    return res.status(200).json(report);
  } catch (err: unknown) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to retrieve weekly progress report',
        details: {},
      },
    });
  }
});
