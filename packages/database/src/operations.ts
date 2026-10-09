import { query } from './client.js';
import type {
  FlagType,
  FlagStatus,
  DisputeStatus,
  WeeklyProgressResponse,
} from '@engineering-simulator/contracts';

export interface FlagRecord {
  id: string;
  attempt_id: string;
  learner_id: string;
  type: FlagType;
  description: string;
  status: FlagStatus;
  created_at: Date;
}

export interface DisputeRecord {
  id: string;
  evaluation_id: string;
  learner_id: string;
  reason: string;
  evidence_description: string;
  status: DisputeStatus;
  created_at: Date;
}

export interface WeeklyReportRecord {
  id: string;
  learner_id: string;
  week_of: string;
  summary: string;
  data_snapshot: Record<string, unknown>;
  created_at: Date;
}

export async function createFlag(data: {
  attemptId: string;
  learnerId: string;
  type: FlagType;
  description: string;
}): Promise<FlagRecord> {
  const sql = `
    INSERT INTO flags (attempt_id, learner_id, type, description, status)
    VALUES ($1, $2, $3, $4, 'open')
    RETURNING *
  `;
  const res = await query<FlagRecord>(sql, [
    data.attemptId,
    data.learnerId,
    data.type,
    data.description,
  ]);
  return res.rows[0];
}

export async function getFlagById(id: string): Promise<FlagRecord | null> {
  const sql = 'SELECT * FROM flags WHERE id = $1 LIMIT 1';
  const res = await query<FlagRecord>(sql, [id]);
  return res.rows[0] || null;
}

export async function getFlagsForLearner(learnerId: string): Promise<FlagRecord[]> {
  const sql = 'SELECT * FROM flags WHERE learner_id = $1 ORDER BY created_at DESC';
  const res = await query<FlagRecord>(sql, [learnerId]);
  return res.rows;
}

export async function getEvaluationDetails(evaluationId: string): Promise<{
  id: string;
  attempt_id: string;
  learner_id: string;
  passed: boolean;
  score: number;
} | null> {
  const sql = `
    SELECT 
      e.id, 
      e.attempt_id, 
      a.learner_id, 
      e.passed, 
      e.score
    FROM evaluations e
    JOIN attempts a ON e.attempt_id = a.id
    WHERE e.id = $1
    LIMIT 1
  `;
  const res = await query<{
    id: string;
    attempt_id: string;
    learner_id: string;
    passed: boolean;
    score: number;
  }>(sql, [evaluationId]);
  return res.rows[0] || null;
}

export async function getDisputeByEvaluationId(
  evaluationId: string
): Promise<DisputeRecord | null> {
  const sql = 'SELECT * FROM disputes WHERE evaluation_id = $1 LIMIT 1';
  const res = await query<DisputeRecord>(sql, [evaluationId]);
  return res.rows[0] || null;
}

export async function createDispute(data: {
  evaluationId: string;
  learnerId: string;
  reason: string;
  evidenceDescription: string;
}): Promise<DisputeRecord> {
  const sql = `
    INSERT INTO disputes (evaluation_id, learner_id, reason, evidence_description, status)
    VALUES ($1, $2, $3, $4, 'open')
    RETURNING *
  `;
  const res = await query<DisputeRecord>(sql, [
    data.evaluationId,
    data.learnerId,
    data.reason,
    data.evidenceDescription,
  ]);
  return res.rows[0];
}

export async function getWeeklyReport(
  learnerId: string,
  weekOf?: string
): Promise<WeeklyReportRecord | null> {
  let sql = 'SELECT * FROM weekly_reports WHERE learner_id = $1';
  const params: unknown[] = [learnerId];
  if (weekOf) {
    sql += ' AND week_of = $2';
    params.push(weekOf);
  } else {
    sql += ' ORDER BY week_of DESC LIMIT 1';
  }
  const res = await query<WeeklyReportRecord>(sql, params);
  return res.rows[0] || null;
}

export async function upsertWeeklyReport(data: {
  learnerId: string;
  weekOf: string;
  summary: string;
  dataSnapshot: Record<string, unknown>;
}): Promise<WeeklyReportRecord> {
  const sql = `
    INSERT INTO weekly_reports (learner_id, week_of, summary, data_snapshot)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (learner_id, week_of) DO UPDATE SET
      summary = EXCLUDED.summary,
      data_snapshot = EXCLUDED.data_snapshot
    RETURNING *
  `;
  const res = await query<WeeklyReportRecord>(sql, [
    data.learnerId,
    data.weekOf,
    data.summary,
    JSON.stringify(data.dataSnapshot),
  ]);
  return res.rows[0];
}

export async function computeWeeklyProgressSnapshot(
  learnerId: string
): Promise<WeeklyProgressResponse> {
  // Check if a persisted report exists for this week
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday of current week
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  const weekOfStr = monday.toISOString().split('T')[0];

  const existingReport = await getWeeklyReport(learnerId, weekOfStr);
  if (existingReport) {
    const snap = existingReport.data_snapshot as unknown as Partial<WeeklyProgressResponse>;
    return {
      weekOf: existingReport.week_of,
      summary: existingReport.summary,
      skillsImproved: snap.skillsImproved ?? [],
      attemptsCompleted: snap.attemptsCompleted ?? 0,
      transferTasksPassed: snap.transferTasksPassed ?? 0,
      masteryChanges: snap.masteryChanges ?? [],
    };
  }

  // Synthesize from activity in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const attemptsRes = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM attempts 
     WHERE learner_id = $1 AND status = 'completed' AND completed_at >= $2`,
    [learnerId, sevenDaysAgo]
  );
  const attemptsCompleted = parseInt(attemptsRes.rows[0]?.count || '0', 10);

  const transferRes = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM evidence_events
     WHERE learner_id = $1 AND evidence_type = 'transfer' AND passed = true AND occurred_at >= $2`,
    [learnerId, sevenDaysAgo]
  );
  const transferTasksPassed = parseInt(transferRes.rows[0]?.count || '0', 10);

  const skillsRes = await query<{
    skill_id: string;
    skill_name: string;
    mastery: number;
    passed_count: string;
  }>(
    `SELECT 
       s.id AS skill_id,
       s.name AS skill_name,
       COALESCE(ss.mastery, 0.0) AS mastery,
       COUNT(ee.id) FILTER (WHERE ee.passed = true) as passed_count
     FROM skills s
     LEFT JOIN skill_states ss ON ss.skill_id = s.id AND ss.learner_id = $1
     LEFT JOIN evidence_events ee ON ee.skill_id = s.id AND ee.learner_id = $1 AND ee.occurred_at >= $2
     WHERE s.status = 'active'
     GROUP BY s.id, s.name, ss.mastery`,
    [learnerId, sevenDaysAgo]
  );

  const skillsImproved: string[] = [];
  const masteryChanges: Array<{ skillId: string; skillName: string; delta: number }> = [];

  for (const row of skillsRes.rows) {
    const passedCount = parseInt(row.passed_count, 10);
    if (passedCount > 0) {
      skillsImproved.push(row.skill_name);
      masteryChanges.push({
        skillId: row.skill_id,
        skillName: row.skill_name,
        delta: Number((passedCount * 0.08).toFixed(2)),
      });
    }
  }

  const summary =
    attemptsCompleted > 0
      ? `Completed ${attemptsCompleted} mission attempt(s) this week with ${transferTasksPassed} transfer verification(s) passed. Demonstrated measurable skill advancement across ${skillsImproved.length > 0 ? skillsImproved.join(', ') : 'targeted domains'}.`
      : 'No mission attempts completed yet this week. Start a practice session to begin building verifiable skill mastery.';

  return {
    weekOf: weekOfStr,
    summary,
    skillsImproved,
    attemptsCompleted,
    transferTasksPassed,
    masteryChanges,
  };
}
