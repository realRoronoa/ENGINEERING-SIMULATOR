export interface MisconceptionRecord {
  id: string;
  slug: string;
  description: string;
  skillId: string;
}

export interface MisconceptionHit {
  learnerId: string;
  misconceptionId: string;
  attemptId: string;
  detectedAt: Date;
  source: 'viva' | 'structured-answer' | 'ai-classification';
}

export function createMisconceptionHit(
  learnerId: string,
  misconceptionId: string,
  attemptId: string,
  source: MisconceptionHit['source']
): MisconceptionHit {
  return {
    learnerId,
    misconceptionId,
    attemptId,
    detectedAt: new Date(),
    source,
  };
}
