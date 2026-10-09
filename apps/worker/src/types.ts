import type {
  DetailedEvaluationResult,
  TestExecutionResult,
} from '@engineering-simulator/evaluator';
import type { EvidenceEventPayload } from '@engineering-simulator/contracts';

export interface GradingJobPayload {
  submissionId: string;
  attemptId: string;
  learnerId: string;
  variantId: string;
  patch: string;
  publicTests?: TestExecutionResult[];
  hiddenTests?: TestExecutionResult[];
  structuredAnswers?: Record<string, string>;
  expectedAnswers?: Record<string, string>;
}

export interface GradingJobResult {
  submissionId: string;
  attemptId: string;
  evaluation: DetailedEvaluationResult;
  evidenceEvent?: EvidenceEventPayload;
  status: 'complete' | 'failed' | 'rejected';
}

export interface WorkerConfig {
  concurrency: number;
  pollIntervalMs: number;
}
