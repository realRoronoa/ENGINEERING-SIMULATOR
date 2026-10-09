export interface Submission {
  id: string;
  attemptId: string;
  patch: string;
  createdAt: Date;
}

export type EvaluationStatus = 'PENDING' | 'PASS' | 'FAIL' | 'ERROR';

export interface EvaluationResult {
  submissionId: string;
  status: EvaluationStatus;
  testsPassed: number;
  testsFailed: number;
  message?: string;
  evaluatedAt: Date;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}
