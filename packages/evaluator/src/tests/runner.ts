import type { TestExecutionResult } from '../types.js';

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  failures: Array<{ testName: string; errorMessage?: string }>;
}

export function summarizeTestResults(results: TestExecutionResult[]): TestSummary {
  let passed = 0;
  let failed = 0;
  const failures: Array<{ testName: string; errorMessage?: string }> = [];

  for (const test of results) {
    if (test.passed) {
      passed += 1;
    } else {
      failed += 1;
      failures.push({
        testName: `${test.suiteName} > ${test.testName}`,
        errorMessage: test.errorMessage,
      });
    }
  }

  return {
    total: results.length,
    passed,
    failed,
    allPassed: failed === 0 && results.length > 0,
    failures,
  };
}
