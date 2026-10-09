export interface ReferenceSystem {
  id: string;
  name: string;
  description: string;
  docker_image: string;
  version: string;
  status: 'active' | 'deprecated';
  created_at: Date;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  track: string;
  status: 'draft' | 'active' | 'paused' | 'retired';
  created_at: Date;
  updated_at: Date;
}

export interface TaskTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  skill_id: string;
  supporting_skill_ids: string[];
  mode: 'debug' | 'build' | 'fix' | 'investigate';
  difficulty_range: string;
  status: 'draft' | 'active' | 'paused' | 'retired';
  created_at: Date;
  updated_at: Date;
}

export interface Variant {
  id: string;
  template_id: string;
  reference_system_id: string;
  version: number;
  previous_version_id?: string | null;
  title: string;
  narrative: string;
  instructions: string;
  fact_sheet: string;
  code_state: Record<string, unknown>;
  hint_ladder: Array<{ index: number; content: string; penalty?: number }>;
  explanation: string;
  misconception_ids: string[];
  viva_question_ids: string[];
  rubric_id?: string | null;
  difficulty: number;
  estimated_minutes: number;
  status: 'draft' | 'review' | 'published' | 'paused' | 'retired';
  published_at?: Date | null;
  created_at: Date;
}

export interface Learner {
  id: string;
  email: string;
  display_name: string;
  goal?: string | null;
  current_role?: string | null;
  years_experience: number;
  target_stack: string[];
  onboarded_at?: Date | null;
  created_at: Date;
}

export interface SkillState {
  id: string;
  learner_id: string;
  skill_id: string;
  mastery: number;
  alpha: number;
  beta: number;
  evidence_count: number;
  last_evidence_at?: Date | null;
  updated_at: Date;
}

export interface Session {
  id: string;
  learner_id: string;
  mode: 'practice' | 'debug' | 'build' | 'transfer';
  started_at: Date;
  ended_at?: Date | null;
}

export interface Attempt {
  id: string;
  session_id: string;
  learner_id: string;
  variant_id: string;
  status:
    | 'created'
    | 'started'
    | 'working'
    | 'submitted'
    | 'grading'
    | 'evaluated'
    | 'viva'
    | 'transfer'
    | 'completed'
    | 'abandoned';
  selector_decision: Record<string, unknown>;
  hints_used: number;
  submissions_count: number;
  started_at?: Date | null;
  submitted_at?: Date | null;
  completed_at?: Date | null;
  created_at: Date;
}

export interface Submission {
  id: string;
  attempt_id: string;
  learner_id: string;
  patch: string;
  structured_answers: Record<string, unknown>;
  client_checksum: string;
  status: 'queued' | 'grading' | 'complete' | 'failed' | 'timeout';
  submitted_at: Date;
}

export interface Evaluation {
  id: string;
  submission_id: string;
  attempt_id: string;
  patch_valid: boolean;
  public_tests_passed: number;
  public_tests_total: number;
  hidden_tests_passed: number;
  hidden_tests_total: number;
  benchmarks_passed?: boolean | null;
  structured_answers_result: Record<string, unknown>;
  rubric_results?: Record<string, unknown> | null;
  passed: boolean;
  score: number;
  created_at: Date;
}
