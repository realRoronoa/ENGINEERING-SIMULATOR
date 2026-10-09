import { validatePatch, evaluateSubmission } from '@engineering-simulator/evaluator';
import type { GradingJobPayload, GradingJobResult } from '../types.js';
import type { EvidenceEventPayload } from '@engineering-simulator/contracts';

/**
 * Handles a single grading job asynchronously:
 * 1. Validates unified diff patch
 * 2. Evaluates test execution outcomes deterministically
 * 3. Builds DetailedEvaluationResult
 * 4. Synthesizes EvidenceEvent for the Learner Model
 */
export async function processGradingJob(payload: GradingJobPayload): Promise<GradingJobResult> {
  const {
    submissionId,
    attemptId,
    learnerId,
    variantId,
    patch,
    publicTests = [],
    hiddenTests = [],
    structuredAnswers,
    expectedAnswers,
  } = payload;

  // 1. Validate patch security & structure
  const patchResult = validatePatch(patch);
  if (!patchResult.valid) {
    const errorEvaluation = evaluateSubmission({
      submissionId,
      attemptId,
      patch,
      publicTests: [],
      hiddenTests: [],
    });

    return {
      submissionId,
      attemptId,
      evaluation: errorEvaluation,
      status: 'rejected',
    };
  }

  // 2. Perform deterministic evaluation
  const evaluation = evaluateSubmission({
    submissionId,
    attemptId,
    patch,
    publicTests,
    hiddenTests,
    structuredAnswers,
    expectedAnswers,
  });

  const isPassing = evaluation.status === 'PASS';

  // 3. Construct EvidenceEvent for Learner Model Bayesian update
  const evidenceEvent: EvidenceEventPayload = {
    learnerId,
    attemptId,
    skillId: variantId,
    evidenceType: 'practice',
    passed: isPassing,
    score: isPassing ? 1.0 : 0.0,
    difficulty: 2,
    taskMode: 'debug',
    occurredAt: new Date(),
  };

  return {
    submissionId,
    attemptId,
    evaluation,
    evidenceEvent,
    status: isPassing ? 'complete' : 'failed',
  };
}
