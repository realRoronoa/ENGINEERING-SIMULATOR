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
  skillId?: string;
  taskMode?: string;
  difficulty?: number;
  evidenceType?: 'practice' | 'transfer' | 'diagnostic';
  patch: string;
  publicTests?: TestExecutionResult[];
  hiddenTests?: TestExecutionResult[];
  structuredAnswers?: Record<string, string>;
  expectedAnswers?: Record<string, string>;
  persistToDb?: boolean;
}

export interface GradingJobResult {
  submissionId: string;
  attemptId: string;
  evaluation: DetailedEvaluationResult;
  evidenceEvent?: EvidenceEventPayload;
  status: 'complete' | 'failed' | 'rejected';
  skillState?: {
    alpha: number;
    beta: number;
    mastery: number;
    evidenceCount: number;
  };
}

export interface WorkerConfig {
  concurrency: number;
  pollIntervalMs: number;
  autoProcess?: boolean;
}
