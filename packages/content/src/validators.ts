import type { Variant, VariantValidationResult, Rubric, Skill } from './types.js';

export function validateVariant(
  variant: Variant,
  options?: {
    knownMisconceptionIds?: string[];
    rubric?: Rubric | null;
  }
): VariantValidationResult {
  const errors: string[] = [];

  if (!variant.title || variant.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!variant.narrative || variant.narrative.trim().length < 10) {
    errors.push('Narrative must be at least 10 characters');
  }

  if (!variant.instructions || variant.instructions.trim().length < 10) {
    errors.push('Instructions must be at least 10 characters');
  }

  if (!variant.factSheet || variant.factSheet.trim().length < 10) {
    errors.push('Fact sheet must be present and verified');
  }

  if (!variant.hintLadder || variant.hintLadder.length < 3 || variant.hintLadder.length > 5) {
    errors.push(`Hint ladder must have 3 to 5 hints (got ${variant.hintLadder?.length ?? 0})`);
  }

  if (!variant.difficulty || variant.difficulty < 1 || variant.difficulty > 5) {
    errors.push(`Difficulty must be between 1 and 5 (got ${variant.difficulty})`);
  }

  if (!variant.estimatedMinutes || variant.estimatedMinutes <= 0) {
    errors.push(`Estimated minutes must be positive (got ${variant.estimatedMinutes})`);
  }

  if (!variant.vivaQuestionIds || variant.vivaQuestionIds.length < 4) {
    errors.push(
      `Viva questions must contain at least 4 questions (got ${variant.vivaQuestionIds?.length ?? 0})`
    );
  }

  if (!variant.explanation || variant.explanation.trim().length < 10) {
    errors.push('Explanation must be present and non-trivial');
  }

  if (variant.rubricId && options?.rubric) {
    if (!options.rubric.criteria || options.rubric.criteria.length < 3) {
      errors.push('Rubric must cover at least 3 criteria');
    }
  }

  if (options?.knownMisconceptionIds && variant.misconceptionIds) {
    for (const misId of variant.misconceptionIds) {
      if (!options.knownMisconceptionIds.includes(misId)) {
        errors.push(`Invalid misconception ID reference: ${misId}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSkill(skill: Skill): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!skill.slug || skill.slug.trim().length < 3) {
    errors.push('Skill slug must be at least 3 characters');
  }
  if (!skill.name || skill.name.trim().length < 3) {
    errors.push('Skill name must be at least 3 characters');
  }
  if (!skill.description || skill.description.trim().length < 10) {
    errors.push('Skill description must be at least 10 characters');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateRubric(rubric: Rubric): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!rubric.name || rubric.name.trim().length < 3) {
    errors.push('Rubric name must be at least 3 characters');
  }
  if (!rubric.criteria || rubric.criteria.length < 3) {
    errors.push('Rubric must define at least 3 criteria');
  }
  const totalWeight = rubric.criteria?.reduce((sum, c) => sum + c.weight, 0) ?? 0;
  if (Math.abs(totalWeight - 1.0) > 0.05) {
    errors.push(`Criteria weights should sum to approximately 1.0 (got ${totalWeight})`);
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
