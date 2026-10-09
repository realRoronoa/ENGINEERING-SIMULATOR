import { describe, it, expect } from 'vitest';
import { processGradingJob, GradingWorker } from './index.js';

describe('Grading Worker Suite (@engineering-simulator/worker)', () => {
  const validPatch = `--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,3 @@
-console.log('old');
+console.log('new');
`;

  const invalidPatch = `not a valid diff header
malformed patch content
`;

  describe('processGradingJob', () => {
    it('rejects malformed patch and generates failing evaluation', async () => {
      const result = await processGradingJob({
        submissionId: 'sub-bad-patch',
        attemptId: 'att-101',
        learnerId: 'learner-1',
        variantId: 'var-1',
        patch: invalidPatch,
      });

      expect(result.status).toBe('rejected');
      expect(result.evaluation.status).toBe('FAIL');
      expect(result.evaluation.testsFailed).toBe(0);
      expect(result.evaluation.message).toContain('Patch validation failed');
    });

    it('processes valid patch, evaluates tests, and emits evidence event', async () => {
      const result = await processGradingJob({
        submissionId: 'sub-valid',
        attemptId: 'att-202',
        learnerId: 'learner-2',
        variantId: 'var-sql-1',
        patch: validPatch,
        publicTests: [{ suiteName: 'Order Suite', testName: 'creates order', passed: true }],
        hiddenTests: [{ suiteName: 'Hidden Suite', testName: 'checks atomicity', passed: true }],
      });

      expect(result.status).toBe('complete');
      expect(result.evaluation.status).toBe('PASS');
      expect(result.evaluation.testsPassed).toBe(2);
      expect(result.evaluation.testsFailed).toBe(0);
      expect(result.evidenceEvent).toBeDefined();
      expect(result.evidenceEvent?.passed).toBe(true);
      expect(result.evidenceEvent?.learnerId).toBe('learner-2');
    });

    it('marks evaluation as failed when hidden tests fail', async () => {
      const result = await processGradingJob({
        submissionId: 'sub-fail',
        attemptId: 'att-303',
        learnerId: 'learner-3',
        variantId: 'var-sql-2',
        patch: validPatch,
        publicTests: [{ suiteName: 'Order Suite', testName: 'creates order', passed: true }],
        hiddenTests: [
          {
            suiteName: 'Hidden Suite',
            testName: 'checks atomicity',
            passed: false,
            errorMessage: 'Race condition',
          },
        ],
      });

      expect(result.status).toBe('failed');
      expect(result.evaluation.status).toBe('FAIL');
      expect(result.evaluation.testsPassed).toBe(1);
      expect(result.evaluation.testsFailed).toBe(1);
      expect(result.evidenceEvent?.passed).toBe(false);
    });
  });

  describe('GradingWorker Queue Management', () => {
    it('enqueues and processes jobs sequentially', async () => {
      const worker = new GradingWorker();
      expect(worker.getQueueLength()).toBe(0);

      worker.enqueueJob({
        submissionId: 'sub-queue-1',
        attemptId: 'att-queue-1',
        learnerId: 'learner-3',
        variantId: 'var-1',
        patch: validPatch,
        publicTests: [{ suiteName: 'Public Suite', testName: 'test 1', passed: true }],
        hiddenTests: [{ suiteName: 'Hidden Suite', testName: 'test 2', passed: true }],
      });

      expect(worker.getQueueLength()).toBe(1);

      const processed = await worker.processNextJob();
      expect(processed?.submissionId).toBe('sub-queue-1');
      expect(worker.getQueueLength()).toBe(0);
      expect(worker.getResult('sub-queue-1')?.status).toBe('complete');
    });

    it('tracks worker lifecycle status', () => {
      const worker = new GradingWorker();
      expect(worker.getStatus().isRunning).toBe(false);

      worker.start();
      expect(worker.getStatus().isRunning).toBe(true);

      worker.stop();
      expect(worker.getStatus().isRunning).toBe(false);
    });
  });
});
