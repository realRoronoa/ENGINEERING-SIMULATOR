import { query } from './client.js';
import type { Attempt } from './types.js';

export async function createAttempt(
  sessionId: string,
  learnerId: string,
  variantId: string
): Promise<Attempt> {
  const sql = `
    INSERT INTO attempts (session_id, learner_id, variant_id, status, selector_decision, hints_used, submissions_count)
    VALUES ($1, $2, $3, 'created', '{}'::jsonb, 0, 0)
    RETURNING *
  `;
  const res = await query<Attempt>(sql, [sessionId, learnerId, variantId]);
  return res.rows[0];
}

export async function getAttemptById(id: string): Promise<Attempt | null> {
  const sql = 'SELECT * FROM attempts WHERE id = $1';
  const res = await query<Attempt>(sql, [id]);
  return res.rows[0] || null;
}
