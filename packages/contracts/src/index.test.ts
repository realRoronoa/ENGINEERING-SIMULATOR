import { describe, it, expect } from 'vitest';
import type { EvaluationResult, EvaluationStatus } from './index.js';

describe('Contracts', () => {
  it('should define EvaluationStatus correctly', () => {
    const status: EvaluationStatus = 'PASS';
    expect(status).toBe('PASS');
  });

  it('should allow creating an EvaluationResult object', () => {
    const result: EvaluationResult = {
      submissionId: 'sub_123',
      status: 'FAIL',
      testsPassed: 0,
      testsFailed: 1,
      evaluatedAt: new Date(),
    };
    expect(result.submissionId).toBe('sub_123');
    expect(result.status).toBe('FAIL');
  });
});
