import type { SkillNode, TaskVariant } from '@engineering-simulator/contracts';
import type { RankedSkill } from '../types.js';

export interface PriorityRankingOptions {
  goalSkills?: string[];
  activeMisconceptions?: string[];
  variants?: TaskVariant[];
}

/**
 * Calculates a priority score for each eligible skill.
 * Prioritizes:
 * 1. Low mastery (high deficit)
 * 2. High goal relevance (direct goal or high goal weight)
 * 3. Active misconceptions targeting this skill's tasks
 */
export function rankSkillsByPriority(
  eligibleSkills: SkillNode[],
  currentMastery: Record<string, number>,
  options: PriorityRankingOptions = {}
): RankedSkill[] {
  const { goalSkills = [], activeMisconceptions = [], variants = [] } = options;
  const goalSet = new Set(goalSkills);
  const activeMisconceptionSet = new Set(activeMisconceptions);

  const ranked = eligibleSkills.map((skill) => {
    const mastery = currentMastery[skill.id] ?? 0.0;
    const deficit = Math.max(0, 1.0 - mastery);

    // Goal relevance weight: 1.5 if explicitly listed in learner's goal, or skill.goalRelevance, or default 1.0
    const isGoal = goalSet.has(skill.id);
    const relevance = isGoal ? 1.5 : (skill.goalRelevance ?? 1.0);

    // Check if this skill has variants targeting active misconceptions
    const hasActiveMisconception = variants.some(
      (v) =>
        v.skillId === skill.id &&
        v.targetsMisconceptions?.some((m) => activeMisconceptionSet.has(m))
    );

    const misconceptionBoost = hasActiveMisconception ? 1.3 : 1.0;

    // Score combines deficit, relevance, and misconception boost
    const priorityScore = deficit * relevance * misconceptionBoost;

    return {
      skill,
      mastery,
      priorityScore,
      hasActiveMisconception,
    };
  });

  // Sort descending by priority score; tiebreak deterministically by skill slug
  return ranked.sort((a, b) => {
    if (Math.abs(b.priorityScore - a.priorityScore) > 0.0001) {
      return b.priorityScore - a.priorityScore;
    }
    return a.skill.slug.localeCompare(b.skill.slug);
  });
}
