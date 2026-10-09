import { describe, it, expect, vi } from 'vitest';
import * as database from '@engineering-simulator/database';
import {
  processGradingJob,
  GradingWorker,
  defaultGradingWorker,
  enqueueGradingJob,
} from './index.js';

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
        persistToDb: false,
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
        persistToDb: false,
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
        persistToDb: false,
      });

      expect(result.status).toBe('failed');
      expect(result.evaluation.status).toBe('FAIL');
      expect(result.evaluation.testsPassed).toBe(1);
      expect(result.evaluation.testsFailed).toBe(1);
      expect(result.evidenceEvent?.passed).toBe(false);
    });

    it('persists evaluation, attempt status, evidence event, and updates Bayesian skill state to database', async () => {
      const updateSubSpy = vi.spyOn(database, 'updateSubmissionStatus').mockResolvedValueOnce({
        id: 'sub-db-1',
        attempt_id: 'att-db-1',
        learner_id: 'learner-db',
        patch: validPatch,
        structured_answers: {},
        client_checksum: '',
        status: 'complete',
        submitted_at: new Date(),
      });

      const createEvalSpy = vi.spyOn(database, 'createEvaluation').mockResolvedValueOnce({
        id: 'eval-db-1',
        submission_id: 'sub-db-1',
        attempt_id: 'att-db-1',
        patch_valid: true,
        public_tests_passed: 1,
        public_tests_total: 1,
        hidden_tests_passed: 1,
        hidden_tests_total: 1,
        benchmarks_passed: null,
        structured_answers_result: {},
        rubric_results: null,
        passed: true,
        score: 1.0,
        created_at: new Date(),
      });

      const updateAttemptSpy = vi.spyOn(database, 'updateAttemptStatus').mockResolvedValueOnce({
        id: 'att-db-1',
        session_id: 'sess-1',
        learner_id: 'learner-db',
        variant_id: 'var-1',
        status: 'evaluated',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      const recordEvidenceSpy = vi.spyOn(database, 'recordEvidenceEvent').mockResolvedValueOnce({
        id: 'ev-1',
        learner_id: 'learner-db',
        attempt_id: 'att-db-1',
        skill_id: 'var-1',
        evidence_type: 'practice',
        passed: true,
        score: 1.0,
        difficulty: 2,
        task_mode: 'debug',
        occurred_at: new Date(),
      });

      vi.spyOn(database, 'getSkillState').mockResolvedValueOnce(null); // No previous state

      const upsertSkillSpy = vi.spyOn(database, 'upsertSkillState').mockResolvedValueOnce({
        id: 'state-1',
        learner_id: 'learner-db',
        skill_id: 'var-1',
        alpha: 2.0,
        beta: 3.0,
        mastery: 0.4,
        evidence_count: 1,
        updated_at: new Date(),
      });

      const result = await processGradingJob({
        submissionId: 'sub-db-1',
        attemptId: 'att-db-1',
        learnerId: 'learner-db',
        variantId: 'var-1',
        patch: validPatch,
        publicTests: [{ suiteName: 'Suite', testName: 'T1', passed: true }],
        hiddenTests: [{ suiteName: 'Suite', testName: 'T2', passed: true }],
        persistToDb: true,
      });

      expect(result.status).toBe('complete');
      expect(result.skillState).toBeDefined();
      expect(result.skillState?.evidenceCount).toBe(1);
      expect(result.skillState?.alpha).toBeGreaterThan(1.0);

      expect(updateSubSpy).toHaveBeenCalledWith('sub-db-1', 'complete');
      expect(createEvalSpy).toHaveBeenCalled();
      expect(updateAttemptSpy).toHaveBeenCalledWith('att-db-1', 'evaluated');
      expect(recordEvidenceSpy).toHaveBeenCalled();
      expect(upsertSkillSpy).toHaveBeenCalled();
    });

    it('processes transfer task submission, emits transfer evidence, and marks attempt as completed', async () => {
      const updateSubSpy = vi.spyOn(database, 'updateSubmissionStatus').mockResolvedValueOnce({
        id: 'sub-transfer-1',
        attempt_id: 'att-transfer-1',
        learner_id: 'learner-transfer',
        patch: validPatch,
        structured_answers: {},
        client_checksum: '',
        status: 'complete',
        submitted_at: new Date(),
      });

      const createEvalSpy = vi.spyOn(database, 'createEvaluation').mockResolvedValueOnce({
        id: 'eval-transfer-1',
        submission_id: 'sub-transfer-1',
        attempt_id: 'att-transfer-1',
        patch_valid: true,
        public_tests_passed: 1,
        public_tests_total: 1,
        hidden_tests_passed: 1,
        hidden_tests_total: 1,
        benchmarks_passed: null,
        structured_answers_result: {},
        rubric_results: null,
        passed: true,
        score: 1.0,
        created_at: new Date(),
      });

      const updateAttemptSpy = vi.spyOn(database, 'updateAttemptStatus').mockResolvedValueOnce({
        id: 'att-transfer-1',
        session_id: 'sess-1',
        learner_id: 'learner-transfer',
        variant_id: 'var-transfer-1',
        status: 'completed',
        selector_decision: {},
        hints_used: 0,
        submissions_count: 1,
        created_at: new Date(),
      });

      const recordEvidenceSpy = vi.spyOn(database, 'recordEvidenceEvent').mockResolvedValueOnce({
        id: 'ev-transfer-1',
        learner_id: 'learner-transfer',
        attempt_id: 'att-transfer-1',
        skill_id: 'skill-1',
        evidence_type: 'transfer',
        passed: true,
        score: 1.0,
        difficulty: 3,
        task_mode: 'transfer',
        occurred_at: new Date(),
      });

      vi.spyOn(database, 'getSkillState').mockResolvedValueOnce(null);

      const upsertSkillSpy = vi.spyOn(database, 'upsertSkillState').mockResolvedValueOnce({
        id: 'state-transfer-1',
        learner_id: 'learner-transfer',
        skill_id: 'skill-1',
        alpha: 3.0,
        beta: 3.0,
        mastery: 0.5,
        evidence_count: 1,
        updated_at: new Date(),
      });

      const result = await processGradingJob({
        submissionId: 'sub-transfer-1',
        attemptId: 'att-transfer-1',
        learnerId: 'learner-transfer',
        variantId: 'var-transfer-1',
        skillId: 'skill-1',
        taskMode: 'transfer',
        evidenceType: 'transfer',
        difficulty: 3,
        patch: validPatch,
        publicTests: [{ suiteName: 'Suite', testName: 'T1', passed: true }],
        hiddenTests: [{ suiteName: 'Suite', testName: 'T2', passed: true }],
        persistToDb: true,
      });

      expect(result.status).toBe('complete');
      expect(result.evidenceEvent?.evidenceType).toBe('transfer');
      expect(updateSubSpy).toHaveBeenCalledWith('sub-transfer-1', 'complete');
      expect(createEvalSpy).toHaveBeenCalled();
      expect(updateAttemptSpy).toHaveBeenCalledWith('att-transfer-1', 'completed');
      expect(recordEvidenceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          evidenceType: 'transfer',
          taskMode: 'transfer',
        })
      );
      expect(upsertSkillSpy).toHaveBeenCalled();
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
        persistToDb: false,
      });

      expect(worker.getQueueLength()).toBe(1);

      const processed = await worker.processNextJob();
      expect(processed?.submissionId).toBe('sub-queue-1');
      expect(worker.getQueueLength()).toBe(0);
      expect(worker.getResult('sub-queue-1')?.status).toBe('complete');
    });

    it('processes all jobs with processAllJobs', async () => {
      const worker = new GradingWorker();
      worker.enqueueJob({
        submissionId: 'sub-1',
        attemptId: 'att-1',
        learnerId: 'learner-1',
        variantId: 'var-1',
        patch: validPatch,
        publicTests: [{ suiteName: 'S1', testName: 'T1', passed: true }],
        hiddenTests: [{ suiteName: 'S2', testName: 'T2', passed: true }],
        persistToDb: false,
      });
      worker.enqueueJob({
        submissionId: 'sub-2',
        attemptId: 'att-2',
        learnerId: 'learner-1',
        variantId: 'var-1',
        patch: invalidPatch,
        persistToDb: false,
      });

      expect(worker.getQueueLength()).toBe(2);
      const results = await worker.processAllJobs();
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('complete');
      expect(results[1].status).toBe('rejected');
      expect(worker.getQueueLength()).toBe(0);
    });

    it('clears queue and results using clear()', () => {
      const worker = new GradingWorker();
      worker.enqueueJob({
        submissionId: 'sub-clear',
        attemptId: 'att-clear',
        learnerId: 'learner-1',
        variantId: 'var-1',
        patch: validPatch,
        persistToDb: false,
      });
      expect(worker.getQueueLength()).toBe(1);
      worker.clear();
      expect(worker.getQueueLength()).toBe(0);
    });

    it('tracks worker lifecycle status', () => {
      const worker = new GradingWorker();
      expect(worker.getStatus().isRunning).toBe(false);

      worker.start();
      expect(worker.getStatus().isRunning).toBe(true);

      worker.stop();
      expect(worker.getStatus().isRunning).toBe(false);
    });

    it('enqueueGradingJob adds to defaultGradingWorker', () => {
      defaultGradingWorker.clear();
      expect(defaultGradingWorker.getQueueLength()).toBe(0);

      enqueueGradingJob({
        submissionId: 'sub-default',
        attemptId: 'att-default',
        learnerId: 'learner-1',
        variantId: 'var-1',
        patch: validPatch,
        persistToDb: false,
      });

      expect(defaultGradingWorker.getQueueLength()).toBe(1);
      defaultGradingWorker.clear();
    });
  });
});
