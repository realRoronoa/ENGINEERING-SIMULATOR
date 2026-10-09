export type SkillLevel = 'NOVICE' | 'BEGINNER' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT';

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  evidenceCount: number;
}

export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  skills: Skill[];
  goal?: string;
  experienceLevel?: string;
  practiceTime?: string;
}

export interface MissionAttempt {
  id: string;
  missionId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED' | 'VIVA_COMPLETED' | 'TRANSFER_COMPLETED';
  startedAt: string;
  completedAt?: string;
}

export interface LearnerState {
  isDemo: boolean;
  isAuthenticated: boolean;
  profile: LearnerProfile | null;
  onboardingCompleted: boolean;
  diagnosticCompleted: boolean;
  attempts: MissionAttempt[];
}

export const INITIAL_DEMO_STATE: LearnerState = {
  isDemo: true,
  isAuthenticated: false,
  profile: null,
  onboardingCompleted: false,
  diagnosticCompleted: false,
  attempts: [],
};
