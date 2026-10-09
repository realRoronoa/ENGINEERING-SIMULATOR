import { describe, it, expect } from 'vitest';
import type { SkillNode, TaskVariant } from '@engineering-simulator/contracts';
import {
  selectNextTask,
  filterEligibleSkills,
  arePrerequisitesMet,
  filterRecentVariants,
  rankSkillsByPriority,
  selectTargetDifficulty,
  calculatePredictedSuccessRate,
} from './index.js';

describe('Selector Engine Suite (@engineering-simulator/selector)', () => {
  const mockSkills: SkillNode[] = [
    {
      id: 'skill-sql-basics',
      slug: 'sql-basics',
      name: 'SQL Basics',
      prerequisites: [],
      goalRelevance: 1.0,
    },
    {
      id: 'skill-transactions',
      slug: 'db-transactions',
      name: 'Database Transactions',
      prerequisites: ['skill-sql-basics'],
      goalRelevance: 1.5,
    },
    {
      id: 'skill-isolation-levels',
      slug: 'isolation-levels',
      name: 'Transaction Isolation Levels',
      prerequisites: ['skill-transactions'],
      goalRelevance: 1.0,
    },
  ];

  const mockVariants: TaskVariant[] = [
    {
      id: 'var-sql-1',
      templateId: 'tmpl-sql-1',
      skillId: 'skill-sql-basics',
      taskMode: 'debug',
      difficulty: 1,
      status: 'published',
    },
    {
      id: 'var-sql-2',
      templateId: 'tmpl-sql-2',
      skillId: 'skill-sql-basics',
      taskMode: 'fix',
      difficulty: 2,
      status: 'published',
    },
    {
      id: 'var-txn-1',
      templateId: 'tmpl-txn-1',
      skillId: 'skill-transactions',
      taskMode: 'debug',
      difficulty: 2,
      status: 'published',
      targetsMisconceptions: ['dirty-read-unhandled'],
    },
    {
      id: 'var-txn-2',
      templateId: 'tmpl-txn-2',
      skillId: 'skill-transactions',
      taskMode: 'fix',
      difficulty: 3,
      status: 'published',
    },
  ];

  describe('Prerequisite Filtering', () => {
    it('allows skills with no prerequisites', () => {
      const eligible = filterEligibleSkills(mockSkills, {});
      expect(eligible.map((s) => s.id)).toEqual(['skill-sql-basics']);
    });

    it('unlocks downstream skills when prerequisite threshold is met (>= 0.65)', () => {
      const mastery = {
        'skill-sql-basics': 0.7,
      };
      const eligible = filterEligibleSkills(mockSkills, mastery);
      expect(eligible.map((s) => s.id)).toContain('skill-transactions');
      expect(eligible.map((s) => s.id)).not.toContain('skill-isolation-levels');
    });

    it('accurately checks arePrerequisitesMet helper', () => {
      expect(arePrerequisitesMet(mockSkills[0], {})).toBe(true);
      expect(arePrerequisitesMet(mockSkills[1], { 'skill-sql-basics': 0.5 })).toBe(false);
      expect(arePrerequisitesMet(mockSkills[1], { 'skill-sql-basics': 0.65 })).toBe(true);
    });
  });

  describe('Priority Ranker', () => {
    it('ranks lower mastery skills higher (mastery deficit prioritization)', () => {
      const eligible = [mockSkills[0], mockSkills[1]];
      const mastery = {
        'skill-sql-basics': 0.8,
        'skill-transactions': 0.2,
      };

      const ranked = rankSkillsByPriority(eligible, mastery);
      expect(ranked[0].skill.id).toBe('skill-transactions');
      expect(ranked[0].priorityScore).toBeGreaterThan(ranked[1].priorityScore);
    });

    it('boosts priority for skills marked in learner goal', () => {
      const eligible = [mockSkills[0], mockSkills[1]];
      const mastery = {
        'skill-sql-basics': 0.5,
        'skill-transactions': 0.5,
      };

      const ranked = rankSkillsByPriority(eligible, mastery, {
        goalSkills: ['skill-transactions'],
      });

      expect(ranked[0].skill.id).toBe('skill-transactions');
    });
  });

  describe('Difficulty Strategy (~70% predicted success rate)', () => {
    it('selects difficulty 1 for low mastery (<0.3)', () => {
      const selection = selectTargetDifficulty(0.2);
      expect(selection.targetDifficulty).toBe(1);
      expect(selection.predictedSuccessRate).toBeGreaterThanOrEqual(0.5);
    });

    it('selects difficulty 2 for moderate mastery (0.5)', () => {
      const selection = selectTargetDifficulty(0.5);
      expect(selection.targetDifficulty).toBe(2);
      expect(selection.predictedSuccessRate).toBe(0.7);
    });

    it('selects higher difficulty (3 or 4) for advanced mastery (0.8)', () => {
      const selection = selectTargetDifficulty(0.8);
      expect(selection.targetDifficulty).toBeGreaterThanOrEqual(3);
    });

    it('bounds predicted success rate cleanly between 0.1 and 0.95', () => {
      expect(calculatePredictedSuccessRate(0.0, 5)).toBeGreaterThanOrEqual(0.1);
      expect(calculatePredictedSuccessRate(1.0, 1)).toBeLessThanOrEqual(0.95);
    });
  });

  describe('Recency Filter', () => {
    it('filters out recently attempted variant IDs', () => {
      const filtered = filterRecentVariants(mockVariants, ['var-sql-1']);
      expect(filtered.map((v) => v.id)).not.toContain('var-sql-1');
      expect(filtered.length).toBe(mockVariants.length - 1);
    });

    it('returns original array when no recent IDs are supplied', () => {
      expect(filterRecentVariants(mockVariants, []).length).toBe(mockVariants.length);
    });
  });

  describe('selectNextTask Orchestrator', () => {
    it('selects foundational task for brand new learner with zero mastery', () => {
      const decision = selectNextTask({
        learnerId: 'learner-new',
        currentMastery: {},
        availableSkills: mockSkills,
        availableVariants: mockVariants,
      });

      expect(decision.skillId).toBe('skill-sql-basics');
      expect(decision.variantId).toBe('var-sql-1');
      expect(decision.difficulty).toBe(1);
      expect(decision.fallback).toBe(false);
      expect(decision.reason).toContain('SQL Basics');
    });

    it('prioritizes variant that targets active misconception', () => {
      const decision = selectNextTask({
        learnerId: 'learner-txn',
        currentMastery: {
          'skill-sql-basics': 0.8,
          'skill-transactions': 0.3,
        },
        activeMisconceptions: ['dirty-read-unhandled'],
        availableSkills: mockSkills,
        availableVariants: mockVariants,
      });

      expect(decision.skillId).toBe('skill-transactions');
      expect(decision.variantId).toBe('var-txn-1');
      expect(decision.reason).toContain('dirty-read-unhandled');
    });

    it('excludes recent variant and picks alternative variant if available', () => {
      const decision = selectNextTask({
        learnerId: 'learner-sql',
        currentMastery: {
          'skill-sql-basics': 0.2,
        },
        recentVariantIds: ['var-sql-1'],
        availableSkills: mockSkills,
        availableVariants: mockVariants,
      });

      expect(decision.skillId).toBe('skill-sql-basics');
      expect(decision.variantId).toBe('var-sql-2');
      expect(decision.fallback).toBe(false);
    });

    it('relaxes recency pool when only recent variants are available', () => {
      const singleVariantList: TaskVariant[] = [mockVariants[0]];
      const decision = selectNextTask({
        learnerId: 'learner-only-one',
        currentMastery: {},
        recentVariantIds: ['var-sql-1'],
        availableSkills: mockSkills,
        availableVariants: singleVariantList,
      });

      expect(decision.variantId).toBe('var-sql-1');
      expect(decision.fallback).toBe(true);
      expect(decision.reason).toContain('Recently seen pool relaxed');
    });

    it('throws error when no published variants exist in the pool', () => {
      const draftVariants: TaskVariant[] = [{ ...mockVariants[0], status: 'draft' }];

      expect(() =>
        selectNextTask({
          learnerId: 'learner-empty',
          currentMastery: {},
          availableSkills: mockSkills,
          availableVariants: draftVariants,
        })
      ).toThrow('No published task variants available in pool');
    });
  });
});
