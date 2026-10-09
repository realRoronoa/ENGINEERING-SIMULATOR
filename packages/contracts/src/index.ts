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

export type TaskMode = 'debug' | 'build' | 'fix' | 'investigate' | 'transfer';

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

export interface TransferTaskDetails {
  id: string;
  variantId: string;
  title: string;
  instructions: string;
  factSheet: string;
  mode: 'transfer';
  difficulty: number;
  aiMentorAvailable: false;
  hintsAvailable: false;
}

export interface TransferStartResponse {
  attemptId: string;
  status: 'transfer';
  transferTask: TransferTaskDetails;
}

export interface SubmissionCreateRequest {
  patch: string;
  structuredAnswers?: Array<{ questionId: string; answer: string }>;
  clientChecksum?: string;
}

export interface SubmissionCreateResponse {
  submissionId: string;
  status: 'queued';
  pollingUrl: string;
}

export interface SubmissionEvaluationDetails {
  id: string;
  passed: boolean;
  score: number;
  publicTestsPassed: number;
  publicTestsTotal: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  benchmarksPassed: boolean | null;
  rubricResults: unknown[];
  feedback: string;
}

export interface SubmissionPollResponse {
  submissionId: string;
  status: 'queued' | 'grading' | 'complete' | 'failed' | 'timeout';
  evaluation: SubmissionEvaluationDetails | null;
}

export interface AttemptDetails {
  id: string;
  status: string;
  variantId: string;
  sessionId: string;
  startedAt: string | null;
  completedAt: string | null;
  hintsUsed: number;
  submissionsCount: number;
}

export interface AttemptResponse {
  attempt: AttemptDetails;
}

export interface TaskWorkspaceMetadata {
  attemptId: string;
  initializedAt: string;
  lastSubmissionId?: string | null;
}

export type LearnerGoal = 'get-a-job' | 'improve-skills' | 'interview-prep';
export type LearnerRole = 'student' | 'junior' | 'mid' | 'senior';

export interface OnboardingRequest {
  goal: LearnerGoal;
  currentRole: LearnerRole;
  yearsExperience: number;
  targetStack: string[];
}

export interface OnboardingResponse {
  learnerId: string;
  diagnosticSessionId: string;
  nextStep: 'diagnostic';
}

export interface DiagnosticAnswer {
  questionId: string;
  answer: string | string[];
}

export interface DiagnosticRequest {
  diagnosticSessionId: string;
  answers: DiagnosticAnswer[];
}

export interface SkillProfileEstimate {
  skillId: string;
  skillName: string;
  masteryEstimate: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface DiagnosticResponse {
  skillProfile: SkillProfileEstimate[];
  sessionId: string;
  nextStep: 'task';
}

export interface LearnerSkillSummary {
  skillId: string;
  skillName: string;
  mastery: number;
  confidence: 'low' | 'medium' | 'high';
  attemptsCount: number;
  lastAttemptAt: string | null;
}

export interface LearnerSkillsResponse {
  skills: LearnerSkillSummary[];
}

export interface SkillEvidenceItem {
  id: string;
  evidenceType: 'practice' | 'transfer' | 'diagnostic';
  passed: boolean;
  score: number;
  difficulty: number;
  timestamp: string;
}

export interface SkillEvidenceResponse {
  skillId: string;
  evidence: SkillEvidenceItem[];
}

export type FlagType = 'incorrect-test' | 'unclear-instructions' | 'wrong-answer' | 'other';
export type FlagStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface CreateFlagRequest {
  attemptId: string;
  type: FlagType;
  description: string;
}

export interface CreateFlagResponse {
  flagId: string;
  status: 'open';
}

export type DisputeStatus = 'open' | 'reviewing' | 'upheld' | 'dismissed';

export interface CreateDisputeRequest {
  reason: string;
  evidenceDescription: string;
}

export interface CreateDisputeResponse {
  disputeId: string;
  status: 'open';
}

export interface MasteryChangeItem {
  skillId: string;
  skillName: string;
  delta: number;
}

export interface WeeklyProgressResponse {
  weekOf: string;
  summary: string;
  skillsImproved: string[];
  attemptsCompleted: number;
  transferTasksPassed: number;
  masteryChanges: MasteryChangeItem[];
}
