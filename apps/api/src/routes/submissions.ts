import { Router, Request, Response } from 'express';
import { getSubmissionWithEvaluation } from '@engineering-simulator/database';

export const submissionRouter = Router();

submissionRouter.get('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to poll submission status.',
        details: {},
      },
    });
  }

  try {
    const result = await getSubmissionWithEvaluation(id);

    if (!result) {
      return res.status(404).json({
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission not found.',
          details: {},
        },
      });
    }

    const { submission, evaluation } = result;

    if (submission.learner_id !== learnerId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to access this submission.',
          details: {},
        },
      });
    }

    res.json({
      submissionId: submission.id,
      status: submission.status,
      evaluation: evaluation
        ? {
            id: evaluation.id,
            passed: evaluation.passed,
            score: evaluation.score,
            publicTestsPassed: evaluation.public_tests_passed,
            publicTestsTotal: evaluation.public_tests_total,
            hiddenTestsPassed: evaluation.hidden_tests_passed,
            hiddenTestsTotal: evaluation.hidden_tests_total,
            benchmarksPassed: evaluation.benchmarks_passed ?? null,
            rubricResults: evaluation.rubric_results ?? [],
            feedback: evaluation.passed
              ? 'Submission passed all test criteria.'
              : 'Submission failed hidden or public tests.',
          }
        : null,
    });
  } catch (err: unknown) {
    console.error('Fetch submission error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not fetch submission status',
        details: {},
      },
    });
  }
});
