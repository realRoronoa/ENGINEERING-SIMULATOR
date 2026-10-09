import type { TaskMode } from '@engineering-simulator/contracts';

export type ContentStatus =
  | 'draft'
  | 'generate'
  | 'validate'
  | 'review'
  | 'publish'
  | 'active'
  | 'published'
  | 'paused'
  | 'retired';

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  track: string;
  status: 'draft' | 'active' | 'paused' | 'retired';
  prerequisites?: string[];
}

export interface SkillEdge {
  id?: string;
  fromSkillId: string;
  toSkillId: string;
  edgeType: 'prerequisite' | 'related';
}

export interface TaskTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  skillId: string;
  supportingSkillIds?: string[];
  mode: TaskMode;
  difficultyRange: [number, number];
  status: 'draft' | 'active' | 'paused' | 'retired';
}

export interface HintItem {
  index: number;
  text: string;
}

export interface Variant {
  id: string;
  templateId: string;
  referenceSystemId: string;
  version: number;
  title: string;
  narrative: string;
  instructions: string;
  factSheet: string;
  hintLadder: HintItem[];
  explanation: string;
  difficulty: number;
  estimatedMinutes: number;
  status: 'draft' | 'review' | 'published' | 'paused' | 'retired';
  misconceptionIds?: string[];
  vivaQuestionIds?: string[];
  rubricId?: string | null;
  publishedAt?: string;
  createdAt?: string;
}

export interface RubricCriterion {
  id: string;
  criterion: string;
  weight: number;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
}

export interface Misconception {
  id: string;
  slug: string;
  description: string;
  skillId: string;
  status: 'active' | 'retired';
}

export interface FaultPattern {
  id: string;
  slug: string;
  name: string;
  description: string;
  patternType: string;
  referenceSystemId: string;
  status: 'draft' | 'active' | 'retired';
}

export interface ReferenceSystem {
  id: string;
  name: string;
  description: string;
  dockerImage: string;
  version: string;
  status: 'active' | 'deprecated';
}

export interface VariantValidationResult {
  valid: boolean;
  errors: string[];
}
