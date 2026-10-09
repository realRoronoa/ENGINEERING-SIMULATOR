import type { SkillNode } from '@engineering-simulator/contracts';

export const DEFAULT_PREREQUISITE_THRESHOLD = 0.65;

/**
 * Checks whether all prerequisites for a given skill are met.
 * A prerequisite is considered met if the learner's mastery for that prerequisite
 * is greater than or equal to the threshold.
 */
export function arePrerequisitesMet(
  skill: SkillNode,
  currentMastery: Record<string, number>,
  threshold: number = DEFAULT_PREREQUISITE_THRESHOLD
): boolean {
  if (!skill.prerequisites || skill.prerequisites.length === 0) {
    return true;
  }

  return skill.prerequisites.every((prereqId) => {
    const prereqMastery = currentMastery[prereqId] ?? 0;
    return prereqMastery >= threshold;
  });
}

/**
 * Filters a list of skills, keeping only those whose prerequisites are satisfied.
 */
export function filterEligibleSkills(
  skills: SkillNode[],
  currentMastery: Record<string, number>,
  threshold: number = DEFAULT_PREREQUISITE_THRESHOLD
): SkillNode[] {
  return skills.filter((skill) => arePrerequisitesMet(skill, currentMastery, threshold));
}
