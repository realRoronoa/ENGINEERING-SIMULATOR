import { query } from './client.js';
import type { HintEvent, AiCall } from './types.js';

export interface VariantHintData {
  id: string;
  title: string;
  instructions: string;
  factSheet: string;
  hintLadder: Array<{ index: number; text: string; content?: string }>;
  mode: string;
}

export async function recordHintEvent(
  attemptId: string,
  learnerId: string,
  hintIndex: number
): Promise<HintEvent> {
  const insertSql = `
    INSERT INTO hint_events (attempt_id, learner_id, hint_index, requested_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *
  `;
  const res = await query<HintEvent>(insertSql, [attemptId, learnerId, hintIndex]);

  // Update hints_used on the attempt record
  await query(
    `
      UPDATE attempts
      SET hints_used = hints_used + 1
      WHERE id = $1
    `,
    [attemptId]
  );

  return res.rows[0];
}

export async function getHintEventsForAttempt(attemptId: string): Promise<HintEvent[]> {
  const sql = `
    SELECT * FROM hint_events
    WHERE attempt_id = $1
    ORDER BY hint_index ASC
  `;
  const res = await query<HintEvent>(sql, [attemptId]);
  return res.rows;
}

export async function getVariantHintData(variantId: string): Promise<VariantHintData | null> {
  const sql = `
    SELECT 
      v.id,
      v.title,
      v.instructions,
      v.fact_sheet AS "factSheet",
      v.hint_ladder AS "hintLadder",
      tt.mode
    FROM variants v
    JOIN task_templates tt ON v.template_id = tt.id
    WHERE v.id = $1
    LIMIT 1
  `;
  const res = await query<{
    id: string;
    title: string;
    instructions: string;
    factSheet: string;
    hintLadder: Array<{ index: number; text?: string; content?: string }>;
    mode: string;
  }>(sql, [variantId]);

  const row = res.rows[0];
  if (!row) {
    return null;
  }

  const ladderRaw =
    row.hintLadder ||
    (row as unknown as { hint_ladder?: Array<{ index: number; text?: string; content?: string }> })
      .hint_ladder ||
    [];

  // Normalize hint ladder entries to ensure `text` is populated (fallback to `content` if authored with content)
  const normalizedLadder = ladderRaw.map((h) => ({
    index: h.index,
    text: h.text || h.content || '',
    content: h.content || h.text || '',
  }));

  const factSheet = row.factSheet || (row as unknown as { fact_sheet?: string }).fact_sheet || '';

  return {
    id: row.id,
    title: row.title,
    instructions: row.instructions,
    factSheet,
    hintLadder: normalizedLadder,
    mode: row.mode,
  };
}

export async function recordAiCall(data: Omit<AiCall, 'id' | 'created_at'>): Promise<AiCall> {
  const sql = `
    INSERT INTO ai_calls (
      attempt_id,
      purpose,
      model,
      prompt_name,
      prompt_version,
      input_tokens,
      output_tokens,
      latency_ms,
      cost_usd,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *
  `;
  const res = await query<AiCall>(sql, [
    data.attempt_id ?? null,
    data.purpose,
    data.model,
    data.prompt_name,
    data.prompt_version,
    data.input_tokens,
    data.output_tokens,
    data.latency_ms,
    data.cost_usd ?? 0.0,
  ]);
  return res.rows[0];
}
