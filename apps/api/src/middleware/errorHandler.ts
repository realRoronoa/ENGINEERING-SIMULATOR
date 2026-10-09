import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.flatten(),
      },
    });
    return;
  }

  const errorObj = err as { code?: string; message?: string; statusCode?: number };
  const statusCode = errorObj.statusCode || 500;
  const code = errorObj.code || 'INTERNAL_SERVER_ERROR';
  const message = errorObj.message || 'An unexpected internal error occurred';

  res.status(statusCode).json({
    error: {
      code,
      message,
      details: {},
    },
  });
}
