export interface Submission {
  id: string;
  attemptId: string;
  patch: string;
  createdAt: Date;
}

export type EvaluationStatus = 'PENDING' | 'PASS' | 'FAIL' | 'ERROR';

export interface EvaluationResult {
  submissionId: string;
  status: EvaluationStatus;
  testsPassed: number;
  testsFailed: number;
  message?: string;
  evaluatedAt: Date;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

export interface EvidenceEventPayload {
  id?: string;
  learnerId: string;
  attemptId: string;
  skillId: string;
  evidenceType: 'practice' | 'transfer' | 'diagnostic';
  passed: boolean;
  score: number;
  difficulty: number;
  taskMode: string;
  occurredAt?: Date;
}

export interface SkillStatePayload {
  learnerId: string;
  skillId: string;
  mastery: number;
  alpha: number;
  beta: number;
  evidenceCount: number;
  lastEvidenceAt?: Date | null;
  updatedAt: Date;
}

export type TaskMode = 'debug' | 'build' | 'fix' | 'investigate';

export interface SkillNode {
  id: string;
  slug: string;
  name: string;
  prerequisites: string[];
  goalRelevance?: number;
}

export interface TaskVariant {
  id: string;
  templateId: string;
  skillId: string;
  taskMode: TaskMode;
  difficulty: number;
  status: 'draft' | 'published' | 'archived';
  targetsMisconceptions?: string[];
}

export interface SelectorDecision {
  variantId: string;
  skillId: string;
  taskMode: TaskMode;
  difficulty: number;
  predictedSuccessRate: number;
  reason: string;
  fallback: boolean;
  timestamp: string;
}

export interface SelectorInput {
  learnerId: string;
  goalSkills?: string[];
  currentMastery: Record<string, number>;
  activeMisconceptions?: string[];
  recentVariantIds?: string[];
  availableSkills: SkillNode[];
  availableVariants: TaskVariant[];
}

export interface VivaQuestion {
  id: string;
  text: string;
  type: 'authored' | 'ai-followup';
}

export interface VivaStartResponse {
  vivaId: string;
  firstQuestion: VivaQuestion;
}

export interface VivaAnswerRequest {
  vivaId: string;
  questionId: string;
  answer: string;
}

export interface VivaAnswerResponse {
  nextQuestion: VivaQuestion | null;
  vivaComplete: boolean;
}

export interface HintRequest {
  currentHintIndex: number;
}

export interface HintItem {
  index: number;
  text: string;
  type: 'authored' | 'ai-worded';
  isLast: boolean;
}

export interface HintResponse {
  hint: HintItem;
}

export interface MentorRequest {
  message: string;
  conversationId?: string | null;
}

export interface MentorResponse {
  reply: string;
  conversationId: string;
  groundedOn: string[];
}
