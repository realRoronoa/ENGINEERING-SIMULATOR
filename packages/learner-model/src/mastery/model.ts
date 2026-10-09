import type { EvidenceEventPayload, SkillStatePayload } from '@engineering-simulator/contracts';
import { getEvidenceWeight } from './evidence-weights.js';

export const INITIAL_ALPHA = 1.0;
export const INITIAL_BETA = 3.0; // 1 / (1 + 3) = 0.25 prior mastery

export function calculateMastery(alpha: number, beta: number): number {
  if (alpha <= 0 || beta <= 0) {
    throw new Error('Alpha and beta parameters must be positive numbers');
  }
  const estimate = alpha / (alpha + beta);
  return Number(Math.max(0.0, Math.min(1.0, estimate)).toFixed(4));
}

export function updateSkillState(
  current: { alpha: number; beta: number; evidenceCount: number },
  event: EvidenceEventPayload
): { alpha: number; beta: number; mastery: number; evidenceCount: number } {
  const { weight, difficultyModifier } = getEvidenceWeight(
    event.evidenceType,
    event.passed,
    event.difficulty
  );

  const increment = weight * difficultyModifier;

  let newAlpha = current.alpha;
  let newBeta = current.beta;

  if (event.passed) {
    newAlpha += increment;
  } else {
    newBeta += increment;
  }

  const mastery = calculateMastery(newAlpha, newBeta);

  return {
    alpha: Number(newAlpha.toFixed(4)),
    beta: Number(newBeta.toFixed(4)),
    mastery,
    evidenceCount: current.evidenceCount + 1,
  };
}

export function initializeSkillState(learnerId: string, skillId: string): SkillStatePayload {
  return {
    learnerId,
    skillId,
    alpha: INITIAL_ALPHA,
    beta: INITIAL_BETA,
    mastery: calculateMastery(INITIAL_ALPHA, INITIAL_BETA),
    evidenceCount: 0,
    lastEvidenceAt: null,
    updatedAt: new Date(),
  };
}
