import type {
  SelectorInput,
  SelectorDecision,
  TaskVariant,
  SkillNode,
} from '@engineering-simulator/contracts';
import { filterEligibleSkills } from './filters/prerequisites.js';
import { filterRecentVariants } from './filters/recency.js';
import { rankSkillsByPriority } from './rankers/priority.js';
import { selectTargetDifficulty, calculatePredictedSuccessRate } from './strategies/difficulty.js';

/**
 * Deterministically selects the next task variant for a learner based on:
 * - Current mastery state
 * - Skill prerequisites graph
 * - Active misconceptions
 * - Recency history
 * - Target ~70% predicted success rate
 */
export function selectNextTask(input: SelectorInput): SelectorDecision {
  const {
    goalSkills = [],
    currentMastery = {},
    activeMisconceptions = [],
    recentVariantIds = [],
    availableSkills = [],
    availableVariants = [],
  } = input;

  if (availableSkills.length === 0) {
    throw new Error('Cannot select task: no available skills provided.');
  }

  // 1. Filter skills by prerequisite satisfaction
  let eligibleSkills = filterEligibleSkills(availableSkills, currentMastery);

  // If no skills have prerequisites satisfied, fallback to foundational skills (0 prerequisites)
  if (eligibleSkills.length === 0) {
    eligibleSkills = availableSkills.filter(
      (s) => !s.prerequisites || s.prerequisites.length === 0
    );
  }

  // If still empty, fall back to all available skills
  if (eligibleSkills.length === 0) {
    eligibleSkills = availableSkills;
  }

  // 2. Rank eligible skills by priority (deficit + goal relevance + active misconceptions)
  const rankedSkills = rankSkillsByPriority(eligibleSkills, currentMastery, {
    goalSkills,
    activeMisconceptions,
    variants: availableVariants,
  });

  const publishedVariants = availableVariants.filter((v) => v.status === 'published');
  if (publishedVariants.length === 0) {
    throw new Error('No published task variants available in pool.');
  }

  const activeMisconceptionSet = new Set(activeMisconceptions);

  // 3. Iterate through ranked skills to find best matching variant
  for (const { skill, mastery, hasActiveMisconception } of rankedSkills) {
    const { targetDifficulty } = selectTargetDifficulty(mastery);

    const skillVariants = publishedVariants.filter((v) => v.skillId === skill.id);
    if (skillVariants.length === 0) {
      continue; // No variants authored for this skill yet, try next ranked skill
    }

    // Apply recency filter
    const nonRecentVariants = filterRecentVariants(skillVariants, recentVariantIds);
    const candidatePool = nonRecentVariants.length > 0 ? nonRecentVariants : skillVariants;
    const isRecencyRelaxed = nonRecentVariants.length === 0 && skillVariants.length > 0;

    // Check if any candidate targets active misconceptions
    let targetVariant: TaskVariant | undefined;
    let reasonDetail = '';

    if (hasActiveMisconception) {
      targetVariant = candidatePool.find((v) =>
        v.targetsMisconceptions?.some((m) => activeMisconceptionSet.has(m))
      );
      if (targetVariant) {
        const matched =
          targetVariant.targetsMisconceptions?.filter((m) => activeMisconceptionSet.has(m)) ?? [];
        reasonDetail = `Selected to remediate active misconception '${matched.join(', ')}' in skill '${skill.name}'.`;
      }
    }

    // Exact difficulty match
    if (!targetVariant) {
      targetVariant = candidatePool.find((v) => v.difficulty === targetDifficulty);
      if (targetVariant) {
        reasonDetail = `Selected skill '${skill.name}' with optimal difficulty ${targetDifficulty} for mastery ${(mastery * 100).toFixed(0)}% (~70% target success).`;
      }
    }

    // Adjacent difficulty match (±1)
    if (!targetVariant) {
      targetVariant = candidatePool.find((v) => Math.abs(v.difficulty - targetDifficulty) <= 1);
      if (targetVariant) {
        reasonDetail = `Selected skill '${skill.name}' with nearest difficulty ${targetVariant.difficulty} (target: ${targetDifficulty}).`;
      }
    }

    // Any available variant for this skill
    if (!targetVariant && candidatePool.length > 0) {
      targetVariant = candidatePool[0];
      reasonDetail = `Selected available variant for high-priority skill '${skill.name}'.`;
    }

    if (targetVariant) {
      const actualSuccessRate = calculatePredictedSuccessRate(mastery, targetVariant.difficulty);

      return {
        variantId: targetVariant.id,
        skillId: skill.id,
        taskMode: targetVariant.taskMode,
        difficulty: targetVariant.difficulty,
        predictedSuccessRate: actualSuccessRate,
        reason: `${reasonDetail}${isRecencyRelaxed ? ' (Recently seen pool relaxed)' : ''}`,
        fallback: isRecencyRelaxed,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 4. Fallback: if no variant found for top skills, take any published variant
  const fallbackVariant = publishedVariants[0];
  const fallbackSkill = availableSkills.find((s) => s.id === fallbackVariant.skillId) as SkillNode;
  const fallbackMastery = currentMastery[fallbackVariant.skillId] ?? 0.0;
  const fallbackSuccessRate = calculatePredictedSuccessRate(
    fallbackMastery,
    fallbackVariant.difficulty
  );

  return {
    variantId: fallbackVariant.id,
    skillId: fallbackVariant.skillId,
    taskMode: fallbackVariant.taskMode,
    difficulty: fallbackVariant.difficulty,
    predictedSuccessRate: fallbackSuccessRate,
    reason: `Fallback variant selected across published pool for skill '${fallbackSkill?.name ?? fallbackVariant.skillId}'.`,
    fallback: true,
    timestamp: new Date().toISOString(),
  };
}
