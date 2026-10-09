import { query } from './client.js';
import type { VivaRecord } from './types.js';

export async function createVivaRecord(
  attemptId: string,
  learnerId: string,
  questions: Array<{ id: string; text: string; type: 'authored' | 'ai-followup' }> = []
): Promise<VivaRecord> {
  const sql = `
    INSERT INTO viva_records (
      attempt_id,
      learner_id,
      questions,
      answers,
      rubric_results,
      status,
      started_at
    )
    VALUES ($1, $2, $3::jsonb, '[]'::jsonb, NULL, 'in-progress', NOW())
    RETURNING *
  `;
  const res = await query<VivaRecord>(sql, [attemptId, learnerId, JSON.stringify(questions)]);
  return res.rows[0];
}

export async function getVivaRecordById(id: string): Promise<VivaRecord | null> {
  const sql = 'SELECT * FROM viva_records WHERE id = $1';
  const res = await query<VivaRecord>(sql, [id]);
  return res.rows[0] || null;
}

export async function getVivaRecordByAttemptId(attemptId: string): Promise<VivaRecord | null> {
  const sql = `
    SELECT * FROM viva_records
    WHERE attempt_id = $1
    ORDER BY started_at DESC
    LIMIT 1
  `;
  const res = await query<VivaRecord>(sql, [attemptId]);
  return res.rows[0] || null;
}

export async function addVivaAnswer(
  vivaId: string,
  questionId: string,
  answer: string,
  nextStatus: 'in-progress' | 'complete' = 'in-progress'
): Promise<VivaRecord | null> {
  const currentRecord = await getVivaRecordById(vivaId);
  if (!currentRecord) {
    return null;
  }

  const existingAnswers = Array.isArray(currentRecord.answers) ? currentRecord.answers : [];
  const updatedAnswers = [
    ...existingAnswers,
    {
      questionId,
      answer,
      submittedAt: new Date().toISOString(),
    },
  ];

  const sql = `
    UPDATE viva_records
    SET answers = $2::jsonb,
        status = $3,
        completed_at = CASE WHEN $3 = 'complete' THEN NOW() ELSE completed_at END
    WHERE id = $1
    RETURNING *
  `;

  const res = await query<VivaRecord>(sql, [vivaId, JSON.stringify(updatedAnswers), nextStatus]);
  return res.rows[0] || null;
}

export async function completeVivaRecord(
  vivaId: string,
  rubricResults?: Record<string, unknown>
): Promise<VivaRecord | null> {
  const sql = `
    UPDATE viva_records
    SET status = 'complete',
        completed_at = NOW(),
        rubric_results = COALESCE($2::jsonb, rubric_results)
    WHERE id = $1
    RETURNING *
  `;
  const res = await query<VivaRecord>(sql, [
    vivaId,
    rubricResults ? JSON.stringify(rubricResults) : null,
  ]);
  return res.rows[0] || null;
}
