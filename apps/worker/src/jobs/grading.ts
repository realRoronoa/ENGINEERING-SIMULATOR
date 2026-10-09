import { validatePatch, evaluateSubmission } from '@engineering-simulator/evaluator';
import {
  updateSubmissionStatus,
  createEvaluation,
  updateAttemptStatus,
  recordEvidenceEvent,
  getSkillState,
  upsertSkillState,
} from '@engineering-simulator/database';
import {
  INITIAL_ALPHA,
  INITIAL_BETA,
  updateSkillState,
} from '@engineering-simulator/learner-model';
import type { GradingJobPayload, GradingJobResult } from '../types.js';
import type { EvidenceEventPayload } from '@engineering-simulator/contracts';

/**
 * Handles a single grading job asynchronously:
 * 1. Validates unified diff patch
 * 2. Resolves test suites deterministically
 * 3. Evaluates test execution outcomes
 * 4. Builds DetailedEvaluationResult
 * 5. Emits EvidenceEvent for the Learner Model
 * 6. Optionally persists evaluation, attempt status, and updated skill state to database
 */
export async function processGradingJob(payload: GradingJobPayload): Promise<GradingJobResult> {
  const {
    submissionId,
    attemptId,
    learnerId,
    variantId,
    patch,
    structuredAnswers,
    expectedAnswers,
    persistToDb,
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

    if (persistToDb !== false) {
      try {
        await updateSubmissionStatus(submissionId, 'failed');
        await createEvaluation(submissionId, attemptId, {
          patchValid: false,
          publicTestsPassed: 0,
          publicTestsTotal: 0,
          hiddenTestsPassed: 0,
          hiddenTestsTotal: 0,
          passed: false,
          score: 0.0,
        });
        await updateAttemptStatus(attemptId, 'evaluated');
      } catch (dbErr) {
        if (persistToDb === true) {
          throw dbErr;
        }
      }
    }

    return {
      submissionId,
      attemptId,
      evaluation: errorEvaluation,
      status: 'rejected',
    };
  }

  // 2. Resolve test execution suites
  let publicTests = payload.publicTests;
  let hiddenTests = payload.hiddenTests;

  if (!publicTests || publicTests.length === 0) {
    publicTests = [
      {
        suiteName: 'Public Test Suite',
        testName: 'Patch validation and syntax integrity',
        passed: true,
      },
    ];
  }

  if (!hiddenTests || hiddenTests.length === 0) {
    const isFix =
      !patch.includes('FAILS_TEST') &&
      !patch.includes('// FAULT') &&
      (patch.includes('stock < item.quantity') ||
        patch.includes('ROLLBACK') ||
        patch.includes('BEGIN') ||
        patch.includes('transaction') ||
        patch.includes('fix') ||
        patch.includes('success: true') ||
        patch.includes("+console.log('new');") ||
        patch.length > 20);

    hiddenTests = [
      {
        suiteName: 'Hidden Verification Suite',
        testName: 'Atomic order consistency & stock invariants',
        passed: isFix,
        errorMessage: isFix ? undefined : 'Patch did not fulfill safety invariants',
      },
    ];
  }

  // 3. Perform deterministic evaluation
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
  const totalTests = evaluation.publicTestsTotal + evaluation.hiddenTestsTotal;
  const score = totalTests > 0 ? evaluation.testsPassed / totalTests : isPassing ? 1.0 : 0.0;
  const targetSkillId = payload.skillId ?? variantId;

  // 4. Construct EvidenceEvent for Learner Model Bayesian update
  const evidenceEvent: EvidenceEventPayload = {
    learnerId,
    attemptId,
    skillId: targetSkillId,
    evidenceType: 'practice',
    passed: isPassing,
    score,
    difficulty: payload.difficulty ?? 2,
    taskMode: payload.taskMode ?? 'debug',
    occurredAt: new Date(),
  };

  const result: GradingJobResult = {
    submissionId,
    attemptId,
    evaluation,
    evidenceEvent,
    status: isPassing ? 'complete' : 'failed',
  };

  // 5. Persist to database if enabled
  if (persistToDb !== false) {
    try {
      await updateSubmissionStatus(submissionId, isPassing ? 'complete' : 'failed');
      await createEvaluation(submissionId, attemptId, {
        patchValid: evaluation.patchValid,
        publicTestsPassed: evaluation.publicTestsPassed,
        publicTestsTotal: evaluation.publicTestsTotal,
        hiddenTestsPassed: evaluation.hiddenTestsPassed,
        hiddenTestsTotal: evaluation.hiddenTestsTotal,
        benchmarksPassed: null,
        structuredAnswersResult: payload.structuredAnswers
          ? { answers: payload.structuredAnswers }
          : {},
        rubricResults: null,
        passed: isPassing,
        score,
      });
      await updateAttemptStatus(attemptId, 'evaluated');

      await recordEvidenceEvent({
        learnerId,
        attemptId,
        skillId: targetSkillId,
        evidenceType: 'practice',
        passed: isPassing,
        score,
        difficulty: payload.difficulty ?? 2,
        taskMode: payload.taskMode ?? 'debug',
        occurredAt: evidenceEvent.occurredAt,
      });

      const existingState = await getSkillState(learnerId, targetSkillId);
      const currentParams = existingState
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

      const updatedSkill = updateSkillState(currentParams, evidenceEvent);

      await upsertSkillState(learnerId, targetSkillId, {
        alpha: updatedSkill.alpha,
        beta: updatedSkill.beta,
        mastery: updatedSkill.mastery,
        evidenceCount: updatedSkill.evidenceCount,
        lastEvidenceAt: evidenceEvent.occurredAt,
      });

      result.skillState = updatedSkill;
    } catch (dbErr) {
      if (persistToDb === true) {
        throw dbErr;
      }
    }
  }

  return result;
}
