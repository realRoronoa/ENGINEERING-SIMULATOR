import { Router, Request, Response } from 'express';
import {
  getSkillsWithMasteryForLearner,
  getEvidenceEventsForSkill,
} from '@engineering-simulator/database';
import { calculateConfidence } from '@engineering-simulator/learner-model';
import type {
  LearnerSkillsResponse,
  SkillEvidenceResponse,
} from '@engineering-simulator/contracts';

export const profileRouter = Router();

profileRouter.get('/skills', async (req: Request, res: Response) => {
  const learnerId = req.learnerId;

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to view skill profile.',
        details: {},
      },
    });
  }

  try {
    const rawSkills = await getSkillsWithMasteryForLearner(learnerId);

    const skills = rawSkills.map((s) => ({
      skillId: s.skill_id,
      skillName: s.skill_name,
      mastery: s.mastery,
      confidence: calculateConfidence(s.alpha, s.beta),
      attemptsCount: s.evidence_count,
      lastAttemptAt: s.last_evidence_at ? s.last_evidence_at.toISOString() : null,
    }));

    const response: LearnerSkillsResponse = { skills };
    res.json(response);
  } catch (err: unknown) {
    console.error('Fetch skills profile error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not fetch learner skills profile.',
        details: {},
      },
    });
  }
});

profileRouter.get('/skills/:skillId/evidence', async (req: Request, res: Response) => {
  const learnerId = req.learnerId;
  const skillId = String(req.params.skillId);

  if (!learnerId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to view skill evidence.',
        details: {},
      },
    });
  }

  try {
    const records = await getEvidenceEventsForSkill(learnerId, skillId);

    const response: SkillEvidenceResponse = {
      skillId,
      evidence: records.map((e) => ({
        id: e.id,
        evidenceType: e.evidence_type,
        passed: e.passed,
        score: e.score,
        difficulty: e.difficulty,
        timestamp: e.occurred_at.toISOString(),
      })),
    };

    res.json(response);
  } catch (err: unknown) {
    console.error('Fetch skill evidence error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not fetch skill evidence history.',
        details: {},
      },
    });
  }
});
