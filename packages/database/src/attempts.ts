import { query } from './client.js';
import type { Attempt } from './types.js';

export async function createAttempt(
  sessionId: string,
  learnerId: string,
  variantId: string,
  selectorDecision: Record<string, unknown> = {}
): Promise<Attempt> {
  const sql = `
    INSERT INTO attempts (session_id, learner_id, variant_id, status, selector_decision, hints_used, submissions_count)
    VALUES ($1, $2, $3, 'created', $4::jsonb, 0, 0)
    RETURNING *
  `;
  const res = await query<Attempt>(sql, [
    sessionId,
    learnerId,
    variantId,
    JSON.stringify(selectorDecision),
  ]);
  return res.rows[0];
}

export async function getAttemptById(id: string): Promise<Attempt | null> {
  const sql = 'SELECT * FROM attempts WHERE id = $1';
  const res = await query<Attempt>(sql, [id]);
  return res.rows[0] || null;
}

export async function getActiveAttemptForSession(sessionId: string): Promise<Attempt | null> {
  const sql = `
    SELECT * FROM attempts
    WHERE session_id = $1
      AND status NOT IN ('completed', 'abandoned')
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const res = await query<Attempt>(sql, [sessionId]);
  return res.rows[0] || null;
}

export async function updateAttemptStatus(
  id: string,
  status: Attempt['status']
): Promise<Attempt | null> {
  const sql = `
    UPDATE attempts
    SET status = $2,
        completed_at = CASE WHEN $2 IN ('completed', 'abandoned') AND completed_at IS NULL THEN NOW() ELSE completed_at END
    WHERE id = $1
    RETURNING *
  `;
  const res = await query<Attempt>(sql, [id, status]);
  return res.rows[0] || null;
}

export async function transitionAttemptToTransfer(
  id: string,
  transferVariantId?: string
): Promise<Attempt | null> {
  const sql = transferVariantId
    ? `
      UPDATE attempts
      SET status = 'transfer',
          variant_id = $2
      WHERE id = $1
      RETURNING *
    `
    : `
      UPDATE attempts
      SET status = 'transfer'
      WHERE id = $1
      RETURNING *
    `;
  const params = transferVariantId ? [id, transferVariantId] : [id];
  const res = await query<Attempt>(sql, params);
  return res.rows[0] || null;
}
