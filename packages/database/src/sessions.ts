import { query } from './client.js';
import type { Session } from './types.js';

export async function createSession(learnerId: string, mode: Session['mode']): Promise<Session> {
  const sql = `
    INSERT INTO sessions (learner_id, mode, started_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `;
  const res = await query<Session>(sql, [learnerId, mode]);
  return res.rows[0];
}

export async function getSessionById(id: string): Promise<Session | null> {
  const sql = 'SELECT * FROM sessions WHERE id = $1';
  const res = await query<Session>(sql, [id]);
  return res.rows[0] || null;
}
