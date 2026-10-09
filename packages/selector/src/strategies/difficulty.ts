export const TARGET_SUCCESS_RATE = 0.7;

/**
 * Computes predicted success probability for a learner with given mastery
 * attempting a task of given difficulty level (1 to 5).
 */
export function calculatePredictedSuccessRate(mastery: number, difficulty: number): number {
  // Calibrated linear-logistic approximation:
  // Base rate 0.5 + mastery - 0.15 * difficulty
  const raw = mastery + 0.5 - difficulty * 0.15;
  const bounded = Math.max(0.1, Math.min(0.95, raw));
  return Math.round(bounded * 100) / 100;
}

export interface DifficultySelection {
  targetDifficulty: number;
  predictedSuccessRate: number;
}

/**
 * Selects difficulty level (1-5) that brings predicted success rate closest to 70%.
 */
export function selectTargetDifficulty(mastery: number): DifficultySelection {
  const candidateDifficulties = [1, 2, 3, 4, 5];
  let bestDifficulty = 1;
  let minDiff = Infinity;
  let bestRate = 0.7;

  for (const difficulty of candidateDifficulties) {
    const rate = calculatePredictedSuccessRate(mastery, difficulty);
    const diff = Math.abs(rate - TARGET_SUCCESS_RATE);

    if (diff < minDiff) {
      minDiff = diff;
      bestDifficulty = difficulty;
      bestRate = rate;
    }
  }

  return {
    targetDifficulty: bestDifficulty,
    predictedSuccessRate: bestRate,
  };
}
