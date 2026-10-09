export interface EvidenceWeightConfig {
  weight: number;
  difficultyModifier: number;
}

export function getEvidenceWeight(
  evidenceType: 'practice' | 'transfer' | 'diagnostic',
  passed: boolean,
  difficulty: number
): EvidenceWeightConfig {
  let baseWeight: number;

  switch (evidenceType) {
    case 'practice':
      baseWeight = passed ? 1.0 : 0.5;
      break;
    case 'transfer':
      baseWeight = passed ? 2.0 : 0.5;
      break;
    case 'diagnostic':
      baseWeight = passed ? 0.3 : 0.2;
      break;
  }

  // Difficulty range [1, 5], difficulty 3 is neutral (1.0)
  const clampedDifficulty = Math.max(1, Math.min(5, difficulty));
  const difficultyModifier = 1.0 + (clampedDifficulty - 3) * 0.1;

  return {
    weight: baseWeight,
    difficultyModifier,
  };
}
