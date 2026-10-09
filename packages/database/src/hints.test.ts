import { describe, it, expect, vi } from 'vitest';
import * as client from './client.js';
import {
  recordHintEvent,
  getHintEventsForAttempt,
  getVariantHintData,
  recordAiCall,
} from './hints.js';

describe('Hints & AI Database Layer (@engineering-simulator/database)', () => {
  it('recordHintEvent inserts new hint event and updates attempt hints_used counter', async () => {
    const querySpy = vi.spyOn(client, 'query');
    querySpy
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'hint-event-1',
            attempt_id: 'att-1',
            learner_id: 'learner-1',
            hint_index: 1,
            requested_at: new Date('2026-10-09T14:30:00Z'),
          },
        ],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'att-1', hints_used: 1 }],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

    const event = await recordHintEvent('att-1', 'learner-1', 1);

    expect(event.id).toBe('hint-event-1');
    expect(event.hint_index).toBe(1);
    expect(querySpy).toHaveBeenCalledTimes(2);
    expect(querySpy.mock.calls[0][1]).toEqual(['att-1', 'learner-1', 1]);
    expect(querySpy.mock.calls[1][0]).toContain('UPDATE attempts');
  });

  it('getHintEventsForAttempt returns hint events for an attempt', async () => {
    const querySpy = vi.spyOn(client, 'query');
    querySpy.mockResolvedValueOnce({
      rows: [
        {
          id: 'hint-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          hint_index: 1,
          requested_at: new Date('2026-10-09T14:30:00Z'),
        },
        {
          id: 'hint-2',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          hint_index: 2,
          requested_at: new Date('2026-10-09T14:35:00Z'),
        },
      ],
      command: 'SELECT',
      rowCount: 2,
      oid: 0,
      fields: [],
    });

    const events = await getHintEventsForAttempt('att-1');
    expect(events).toHaveLength(2);
    expect(events[0].hint_index).toBe(1);
    expect(events[1].hint_index).toBe(2);
  });

  it('getVariantHintData returns normalized hint ladder and fact sheet', async () => {
    const querySpy = vi.spyOn(client, 'query');
    querySpy.mockResolvedValueOnce({
      rows: [
        {
          id: 'var-1',
          title: 'N+1 Query Resolution',
          instructions: 'Fix the N+1 query issue in /products',
          fact_sheet: 'Products are retrieved without join',
          hint_ladder: [
            { index: 1, text: 'Check the query logs' },
            { index: 2, content: 'Use an SQL JOIN clause' },
          ],
          mode: 'fix',
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const data = await getVariantHintData('var-1');
    expect(data).not.toBeNull();
    expect(data?.title).toBe('N+1 Query Resolution');
    expect(data?.hintLadder).toHaveLength(2);
    expect(data?.hintLadder[0].text).toBe('Check the query logs');
    expect(data?.hintLadder[1].text).toBe('Use an SQL JOIN clause');
  });

  it('getVariantHintData returns null if variant not found', async () => {
    const querySpy = vi.spyOn(client, 'query');
    querySpy.mockResolvedValueOnce({
      rows: [],
      command: 'SELECT',
      rowCount: 0,
      oid: 0,
      fields: [],
    });

    const data = await getVariantHintData('var-nonexistent');
    expect(data).toBeNull();
  });

  it('recordAiCall inserts AI audit log record', async () => {
    const querySpy = vi.spyOn(client, 'query');
    querySpy.mockResolvedValueOnce({
      rows: [
        {
          id: 'ai-1',
          attempt_id: 'att-1',
          purpose: 'mentor',
          model: 'claude-3-5-sonnet-20241022',
          prompt_name: 'mentor',
          prompt_version: 'v1',
          input_tokens: 350,
          output_tokens: 120,
          latency_ms: 1420,
          cost_usd: 0.003,
          created_at: new Date('2026-10-09T14:40:00Z'),
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const aiCall = await recordAiCall({
      attempt_id: 'att-1',
      purpose: 'mentor',
      model: 'claude-3-5-sonnet-20241022',
      prompt_name: 'mentor',
      prompt_version: 'v1',
      input_tokens: 350,
      output_tokens: 120,
      latency_ms: 1420,
      cost_usd: 0.003,
    });

    expect(aiCall.id).toBe('ai-1');
    expect(aiCall.purpose).toBe('mentor');
    expect(aiCall.model).toBe('claude-3-5-sonnet-20241022');
  });
});
