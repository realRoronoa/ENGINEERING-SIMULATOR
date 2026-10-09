import { LearnerState } from '../../types/learner.js';

export const DEMO_USER_FIXTURE: LearnerState = {
  isDemo: true,
  isAuthenticated: true,
  onboardingCompleted: true,
  diagnosticCompleted: true,
  profile: {
    id: 'demo-user-alex',
    name: 'Alex Morgan',
    email: 'demo@engineering-simulator.local',
    experienceLevel: 'intermediate',
    goal: 'backend_mastery',
    practiceTime: 'intensive',
    skills: [
      {
        id: 's-concurrency',
        name: 'Concurrency & Idempotency',
        level: 'PROFICIENT',
        evidenceCount: 3,
      },
      {
        id: 's-resilience',
        name: 'Resilience & Retries',
        level: 'COMPETENT',
        evidenceCount: 2,
      },
      {
        id: 's-data',
        name: 'Data Consistency',
        level: 'NOVICE',
        evidenceCount: 1,
      },
    ],
  },
  attempts: [
    {
      id: 'att-4412-1',
      missionId: 'm-4412',
      status: 'TRANSFER_COMPLETED',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-4413-1',
      missionId: 'm-4413',
      status: 'IN_PROGRESS',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
