import { describe, it, expect } from 'vitest';
import { validatePatch } from './patch/validator.js';
import { evaluateSubmission } from './evaluation/builder.js';

describe('Evaluator Engine Suite', () => {
  describe('Patch Validator', () => {
    it('accepts clean unified diffs targeting allowed files', () => {
      const validPatch = `--- a/src/services/orders.ts
+++ b/src/services/orders.ts
@@ -10,3 +10,4 @@
+  if (stock < requested) throw new Error("Out of stock");
`;
      const result = validatePatch(validPatch);
      expect(result.valid).toBe(true);
      expect(result.targetFiles).toContain('src/services/orders.ts');
    });

    it('rejects empty patch submissions', () => {
      const result = validatePatch('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Patch is empty');
    });

    it('security: rejects patches attempting to tamper with hidden tests', () => {
      const maliciousPatch = `--- a/tests/hidden/orderAtomicity.test.ts
+++ b/tests/hidden/orderAtomicity.test.ts
@@ -1,3 +1,3 @@
-expect(actual).toBe(expected);
+expect(true).toBe(true);
`;
      const result = validatePatch(maliciousPatch);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Modification of protected file path is prohibited');
    });
  });

  describe('Deterministic Evaluation Result Builder', () => {
    const samplePatch = `--- a/src/orders.ts
+++ b/src/orders.ts
@@ -1,1 +1,2 @@
+// fix
`;

    it('returns FAIL when hidden tests fail', () => {
      const result = evaluateSubmission({
        submissionId: 'sub-001',
        attemptId: 'att-001',
        patch: samplePatch,
        publicTests: [{ suiteName: 'Public', testName: 'sanity check', passed: true }],
        hiddenTests: [
          {
            suiteName: 'Hidden',
            testName: 'order concurrency check',
            passed: false,
            errorMessage: 'Stock went negative: -5',
          },
        ],
      });

      expect(result.status).toBe('FAIL');
      expect(result.testsPassed).toBe(1);
      expect(result.testsFailed).toBe(1);
      expect(result.message).toContain('1 hidden test(s) failed');
    });

    it('returns PASS when all public and hidden tests pass', () => {
      const result = evaluateSubmission({
        submissionId: 'sub-002',
        attemptId: 'att-002',
        patch: samplePatch,
        publicTests: [{ suiteName: 'Public', testName: 'sanity check', passed: true }],
        hiddenTests: [
          { suiteName: 'Hidden', testName: 'atomicity check', passed: true },
          { suiteName: 'Hidden', testName: 'stock bound check', passed: true },
        ],
      });

      expect(result.status).toBe('PASS');
      expect(result.testsPassed).toBe(3);
      expect(result.testsFailed).toBe(0);
      expect(result.message).toContain('All public and hidden test suites passed cleanly');
    });
  });
});
