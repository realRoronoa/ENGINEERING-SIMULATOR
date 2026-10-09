import { describe, it, expect } from 'vitest';
import {
  calculateMastery,
  updateSkillState,
  initializeSkillState,
  INITIAL_ALPHA,
  INITIAL_BETA,
} from './mastery/model.js';
import { getEvidenceWeight } from './mastery/evidence-weights.js';
import { createMisconceptionHit } from './misconceptions/tracker.js';

describe('Learner Model Suite (Bayesian Beta Mastery)', () => {
  describe('calculateMastery', () => {
    it('calculates expected mastery estimate', () => {
      expect(calculateMastery(1, 3)).toBe(0.25);
      expect(calculateMastery(5, 5)).toBe(0.5);
      expect(calculateMastery(9, 1)).toBe(0.9);
    });

    it('rejects invalid non-positive parameters', () => {
      expect(() => calculateMastery(0, 3)).toThrow();
      expect(() => calculateMastery(2, -1)).toThrow();
    });
  });

  describe('updateSkillState', () => {
    it('initializes skill state with prior 25% mastery', () => {
      const state = initializeSkillState('learner-1', 'skill-1');
      expect(state.alpha).toBe(INITIAL_ALPHA);
      expect(state.beta).toBe(INITIAL_BETA);
      expect(state.mastery).toBe(0.25);
      expect(state.evidenceCount).toBe(0);
    });

    it('increments alpha and increases mastery on practice pass', () => {
      const current = { alpha: 1.0, beta: 3.0, evidenceCount: 0 };
      const updated = updateSkillState(current, {
        learnerId: 'learner-1',
        attemptId: 'att-1',
        skillId: 'skill-1',
        evidenceType: 'practice',
        passed: true,
        score: 1.0,
        difficulty: 3, // neutral difficulty modifier (1.0)
        taskMode: 'debug',
      });

      expect(updated.alpha).toBe(2.0); // 1.0 + 1.0
      expect(updated.beta).toBe(3.0);
      expect(updated.mastery).toBe(0.4); // 2 / 5
      expect(updated.evidenceCount).toBe(1);
    });

    it('gives higher weight to transfer tasks than practice tasks', () => {
      const current = { alpha: 1.0, beta: 3.0, evidenceCount: 0 };
      const updated = updateSkillState(current, {
        learnerId: 'learner-1',
        attemptId: 'att-2',
        skillId: 'skill-1',
        evidenceType: 'transfer',
        passed: true,
        score: 1.0,
        difficulty: 3,
        taskMode: 'transfer',
      });

      expect(updated.alpha).toBe(3.0); // 1.0 + 2.0 (transfer weight)
      expect(updated.beta).toBe(3.0);
      expect(updated.mastery).toBe(0.5); // 3 / 6
    });

    it('increments beta and decreases mastery on failure', () => {
      const current = { alpha: 2.0, beta: 2.0, evidenceCount: 2 };
      const updated = updateSkillState(current, {
        learnerId: 'learner-1',
        attemptId: 'att-3',
        skillId: 'skill-1',
        evidenceType: 'practice',
        passed: false,
        score: 0.0,
        difficulty: 3,
        taskMode: 'debug',
      });

      expect(updated.alpha).toBe(2.0);
      expect(updated.beta).toBe(2.5); // 2.0 + 0.5 (fail weight)
      expect(updated.mastery).toBeLessThan(0.5);
    });
  });

  describe('Evidence Weights & Difficulty Scaling', () => {
    it('scales weight higher for high difficulty tasks', () => {
      const lowDiff = getEvidenceWeight('practice', true, 1);
      const highDiff = getEvidenceWeight('practice', true, 5);

      expect(highDiff.difficultyModifier).toBeGreaterThan(lowDiff.difficultyModifier);
    });
  });

  describe('Misconceptions Tracker', () => {
    it('creates misconception hit record with required fields', () => {
      const hit = createMisconceptionHit(
        'learner-1',
        'misc-n-plus-one',
        'att-99',
        'structured-answer'
      );

      expect(hit.learnerId).toBe('learner-1');
      expect(hit.misconceptionId).toBe('misc-n-plus-one');
      expect(hit.source).toBe('structured-answer');
      expect(hit.detectedAt).toBeInstanceOf(Date);
    });
  });
});
