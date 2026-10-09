import type { EvaluationStatus } from '@engineering-simulator/contracts';
import { validatePatch } from '../patch/validator.js';
import { summarizeTestResults } from '../tests/runner.js';
import type { GradingInput, DetailedEvaluationResult } from '../types.js';

export function evaluateSubmission(input: GradingInput): DetailedEvaluationResult {
  const patchResult = validatePatch(input.patch);

  if (!patchResult.valid) {
    return {
      submissionId: input.submissionId,
      status: 'FAIL',
      testsPassed: 0,
      testsFailed: 0,
      message: `Patch validation failed: ${patchResult.errors.join('; ')}`,
      evaluatedAt: new Date(),
      patchValid: false,
      publicTestsPassed: 0,
      publicTestsTotal: 0,
      hiddenTestsPassed: 0,
      hiddenTestsTotal: 0,
    };
  }

  const publicSummary = summarizeTestResults(input.publicTests);
  const hiddenSummary = summarizeTestResults(input.hiddenTests);

  // Check structured answers if provided
  let structuredCorrect = true;
  if (input.expectedAnswers && Object.keys(input.expectedAnswers).length > 0) {
    const learnerAnswers = input.structuredAnswers || {};
    for (const [key, expected] of Object.entries(input.expectedAnswers)) {
      if (learnerAnswers[key]?.trim().toLowerCase() !== expected.trim().toLowerCase()) {
        structuredCorrect = false;
        break;
      }
    }
  }

  const passedTests = publicSummary.passed + hiddenSummary.passed;
  const failedTests = publicSummary.failed + hiddenSummary.failed;

  // Pure deterministic pass/fail rule
  const isPassed =
    patchResult.valid && hiddenSummary.allPassed && publicSummary.allPassed && structuredCorrect;

  let status: EvaluationStatus = 'FAIL';
  let message: string;

  if (isPassed) {
    status = 'PASS';
    message = 'All public and hidden test suites passed cleanly.';
  } else {
    status = 'FAIL';
    const failureReasons: string[] = [];
    if (hiddenSummary.failed > 0) {
      failureReasons.push(`${hiddenSummary.failed} hidden test(s) failed`);
    }
    if (publicSummary.failed > 0) {
      failureReasons.push(`${publicSummary.failed} public test(s) failed`);
    }
    if (!structuredCorrect) {
      failureReasons.push('Structured answers did not match expected criteria');
    }
    message = `Evaluation failed: ${failureReasons.join(', ')}`;
  }

  return {
    submissionId: input.submissionId,
    status,
    testsPassed: passedTests,
    testsFailed: failedTests,
    message,
    evaluatedAt: new Date(),
    patchValid: true,
    publicTestsPassed: publicSummary.passed,
    publicTestsTotal: publicSummary.total,
    hiddenTestsPassed: hiddenSummary.passed,
    hiddenTestsTotal: hiddenSummary.total,
    structuredAnswersCorrect: structuredCorrect,
  };
}
