import { query } from './client.js';
import type { SkillState } from './types.js';

export interface EvidenceEventRecord {
  id: string;
  learner_id: string;
  attempt_id: string;
  skill_id: string;
  evidence_type: 'practice' | 'transfer' | 'diagnostic';
  passed: boolean;
  score: number;
  difficulty: number;
  task_mode: string;
  occurred_at: Date;
}

export async function getSkillState(
  learnerId: string,
  skillId: string
): Promise<SkillState | null> {
  const sql = `
    SELECT * FROM skill_states
    WHERE learner_id = $1 AND skill_id = $2
    LIMIT 1
  `;
  const res = await query<SkillState>(sql, [learnerId, skillId]);
  return res.rows[0] || null;
}

export async function getSkillStatesForLearner(learnerId: string): Promise<SkillState[]> {
  const sql = `
    SELECT * FROM skill_states
    WHERE learner_id = $1
    ORDER BY updated_at DESC
  `;
  const res = await query<SkillState>(sql, [learnerId]);
  return res.rows;
}

export async function upsertSkillState(
  learnerId: string,
  skillId: string,
  data: {
    alpha: number;
    beta: number;
    mastery: number;
    evidenceCount: number;
    lastEvidenceAt?: Date | null;
  }
): Promise<SkillState> {
  const sql = `
    INSERT INTO skill_states (
      learner_id,
      skill_id,
      alpha,
      beta,
      mastery,
      evidence_count,
      last_evidence_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (learner_id, skill_id)
    DO UPDATE SET
      alpha = EXCLUDED.alpha,
      beta = EXCLUDED.beta,
      mastery = EXCLUDED.mastery,
      evidence_count = EXCLUDED.evidence_count,
      last_evidence_at = EXCLUDED.last_evidence_at,
      updated_at = NOW()
    RETURNING *
  `;
  const res = await query<SkillState>(sql, [
    learnerId,
    skillId,
    data.alpha,
    data.beta,
    data.mastery,
    data.evidenceCount,
    data.lastEvidenceAt ?? new Date(),
  ]);
  return res.rows[0];
}

export async function recordEvidenceEvent(data: {
  learnerId: string;
  attemptId: string;
  skillId: string;
  evidenceType: 'practice' | 'transfer' | 'diagnostic';
  passed: boolean;
  score: number;
  difficulty: number;
  taskMode: string;
  occurredAt?: Date;
}): Promise<EvidenceEventRecord> {
  const sql = `
    INSERT INTO evidence_events (
      learner_id,
      attempt_id,
      skill_id,
      evidence_type,
      passed,
      score,
      difficulty,
      task_mode,
      occurred_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()))
    RETURNING *
  `;
  const res = await query<EvidenceEventRecord>(sql, [
    data.learnerId,
    data.attemptId,
    data.skillId,
    data.evidenceType,
    data.passed,
    data.score,
    data.difficulty,
    data.taskMode,
    data.occurredAt ?? new Date(),
  ]);
  return res.rows[0];
}

export async function getEvidenceEventsForLearner(
  learnerId: string
): Promise<EvidenceEventRecord[]> {
  const sql = `
    SELECT * FROM evidence_events
    WHERE learner_id = $1
    ORDER BY occurred_at DESC
  `;
  const res = await query<EvidenceEventRecord>(sql, [learnerId]);
  return res.rows;
}
