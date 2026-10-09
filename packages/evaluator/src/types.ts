import type { EvaluationResult } from '@engineering-simulator/contracts';

export interface PatchValidationResult {
  valid: boolean;
  errors: string[];
  targetFiles: string[];
}

export interface TestExecutionResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  durationMs?: number;
  errorMessage?: string;
}

export interface GradingInput {
  submissionId: string;
  attemptId: string;
  patch: string;
  publicTests: TestExecutionResult[];
  hiddenTests: TestExecutionResult[];
  structuredAnswers?: Record<string, string>;
  expectedAnswers?: Record<string, string>;
}

export interface DetailedEvaluationResult extends EvaluationResult {
  patchValid: boolean;
  publicTestsPassed: number;
  publicTestsTotal: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  structuredAnswersCorrect?: boolean;
}
