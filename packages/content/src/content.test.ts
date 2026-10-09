import { describe, it, expect } from 'vitest';
import {
  loadSkills,
  loadSkillGraph,
  loadTemplates,
  loadVariants,
  loadVariantById,
  loadRubricById,
  loadMisconceptions,
  validateVariant,
  validateSkill,
  validateRubric,
  SKILLS,
  VARIANTS,
  RUBRICS,
  MISCONCEPTIONS,
} from './index.js';

describe('Content Engine (@engineering-simulator/content)', () => {
  it('loadSkills returns 12 authored skills', async () => {
    const skills = await loadSkills();
    expect(skills).toHaveLength(12);
    expect(skills.map((s) => s.slug)).toContain('db-query-design');
    expect(skills.map((s) => s.slug)).toContain('db-concurrency');
    expect(skills.map((s) => s.slug)).toContain('api-error-handling');
    expect(skills.map((s) => s.slug)).toContain('async-queue-processing');
  });

  it('loadSkillGraph returns directed prerequisite edges without cycles', async () => {
    const edges = await loadSkillGraph();
    expect(edges.length).toBeGreaterThan(0);
    for (const edge of edges) {
      expect(edge.fromSkillId).not.toBe(edge.toSkillId);
      expect(['prerequisite', 'related']).toContain(edge.edgeType);
    }
  });

  it('loadTemplates returns valid task templates with difficulty ranges', async () => {
    const templates = await loadTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(4);
    for (const tmpl of templates) {
      expect(tmpl.difficultyRange[0]).toBeLessThanOrEqual(tmpl.difficultyRange[1]);
      expect(['debug', 'fix', 'build', 'investigate', 'transfer']).toContain(tmpl.mode);
    }
  });

  it('loadVariants supports status and skill filtering', async () => {
    const allVariants = await loadVariants();
    expect(allVariants.length).toBeGreaterThanOrEqual(4);

    const publishedOnly = await loadVariants({ status: 'published' });
    expect(publishedOnly.length).toBe(allVariants.length);

    const dbQuerySkillId = '22222222-2222-2222-2222-222222220001';
    const dbQueryVariants = await loadVariants({ skillId: dbQuerySkillId });
    expect(dbQueryVariants.length).toBeGreaterThanOrEqual(1);
    expect(dbQueryVariants[0].title).toContain('Products endpoint is slow');
  });

  it('loadVariantById returns variant by ID and null for unknown ID', async () => {
    const variant = await loadVariantById('66666666-6666-6666-6666-666666660001');
    expect(variant).not.toBeNull();
    expect(variant?.title).toBe('Shopverse: Products endpoint is slow');

    const missing = await loadVariantById('non-existent-id');
    expect(missing).toBeNull();
  });

  it('loadRubricById loads rubric and checks criteria weights', async () => {
    const rubric = await loadRubricById('44444444-4444-4444-4444-444444440001');
    expect(rubric).not.toBeNull();
    expect(rubric?.criteria).toHaveLength(3);

    const totalWeight = rubric?.criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 2);
  });

  it('loadMisconceptions returns active catalog items', async () => {
    const misconceptions = await loadMisconceptions();
    expect(misconceptions.length).toBeGreaterThanOrEqual(4);
    expect(misconceptions.map((m) => m.slug)).toContain('joins-always-slower');
  });

  it('all authored variants satisfy strict validation rules', () => {
    const knownMisconceptions = MISCONCEPTIONS.map((m) => m.id);

    for (const variant of VARIANTS) {
      const rubric = variant.rubricId
        ? (RUBRICS.find((r) => r.id === variant.rubricId) ?? null)
        : null;
      const result = validateVariant(variant, {
        knownMisconceptionIds: knownMisconceptions,
        rubric,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('validateVariant catches missing required fields and short hint ladders', () => {
    const invalidVariant = {
      ...VARIANTS[0],
      title: 'Hi',
      hintLadder: [{ index: 1, text: 'Single hint' }],
      vivaQuestionIds: ['q1'],
    };

    const res = validateVariant(invalidVariant);
    expect(res.valid).toBe(false);
    expect(res.errors).toContain('Title must be at least 5 characters');
    expect(res.errors).toContain('Hint ladder must have 3 to 5 hints (got 1)');
    expect(res.errors).toContain('Viva questions must contain at least 4 questions (got 1)');
  });

  it('validateSkill and validateRubric enforce structure standards', () => {
    const skillRes = validateSkill(SKILLS[0]);
    expect(skillRes.valid).toBe(true);

    const rubricRes = validateRubric(RUBRICS[0]);
    expect(rubricRes.valid).toBe(true);

    const badRubric = {
      id: 'bad-rubric',
      name: 'Bad',
      criteria: [{ id: '1', criterion: 'Crit 1', weight: 0.2 }],
    };
    const badRubricRes = validateRubric(badRubric);
    expect(badRubricRes.valid).toBe(false);
    expect(badRubricRes.errors).toContain('Rubric must define at least 3 criteria');
  });
});
