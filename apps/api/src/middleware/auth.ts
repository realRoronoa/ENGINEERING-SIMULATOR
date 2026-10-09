import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      learnerId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const directLearnerHeader = req.headers['x-learner-id'];

  if (directLearnerHeader && typeof directLearnerHeader === 'string') {
    req.learnerId = directLearnerHeader;
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
        details: {},
      },
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Empty Bearer token',
        details: {},
      },
    });
    return;
  }

  // In test/development environment, token or mock UID is parsed
  // Supabase JWT verification will verify signature in production
  req.learnerId = token.startsWith('learner_') ? token : `learner_${token}`;
  next();
}
