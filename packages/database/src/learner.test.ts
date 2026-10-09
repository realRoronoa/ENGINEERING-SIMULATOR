import { describe, it, expect, vi } from 'vitest';
import * as client from './client.js';
import {
  getSkillState,
  getSkillStatesForLearner,
  upsertSkillState,
  recordEvidenceEvent,
  getEvidenceEventsForLearner,
} from './learner.js';

describe('Learner Model Database Layer (@engineering-simulator/database)', () => {
  it('getSkillState queries skill_states by learner and skill ID', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'state-1',
          learner_id: 'learner-1',
          skill_id: 'skill-sql',
          mastery: 0.65,
          alpha: 4.0,
          beta: 2.0,
          evidence_count: 5,
          last_evidence_at: new Date('2026-10-09T10:00:00Z'),
          updated_at: new Date('2026-10-09T10:00:00Z'),
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const state = await getSkillState('learner-1', 'skill-sql');
    expect(state).not.toBeNull();
    expect(state?.mastery).toBe(0.65);
    expect(state?.alpha).toBe(4.0);
    expect(state?.beta).toBe(2.0);
  });

  it('upsertSkillState performs ON CONFLICT insert or update', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'state-1',
          learner_id: 'learner-1',
          skill_id: 'skill-sql',
          alpha: 5.5,
          beta: 2.0,
          mastery: 0.7333,
          evidence_count: 6,
          last_evidence_at: new Date('2026-10-09T12:00:00Z'),
          updated_at: new Date('2026-10-09T12:00:00Z'),
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const state = await upsertSkillState('learner-1', 'skill-sql', {
      alpha: 5.5,
      beta: 2.0,
      mastery: 0.7333,
      evidenceCount: 6,
    });

    expect(state.alpha).toBe(5.5);
    expect(state.mastery).toBe(0.7333);
    expect(state.evidence_count).toBe(6);
  });

  it('recordEvidenceEvent inserts append-only evidence record', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'ev-1',
          learner_id: 'learner-1',
          attempt_id: 'att-1',
          skill_id: 'skill-sql',
          evidence_type: 'practice',
          passed: true,
          score: 1.0,
          difficulty: 3,
          task_mode: 'debug',
          occurred_at: new Date('2026-10-09T12:00:00Z'),
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const event = await recordEvidenceEvent({
      learnerId: 'learner-1',
      attemptId: 'att-1',
      skillId: 'skill-sql',
      evidenceType: 'practice',
      passed: true,
      score: 1.0,
      difficulty: 3,
      taskMode: 'debug',
    });

    expect(event.id).toBe('ev-1');
    expect(event.passed).toBe(true);
    expect(event.difficulty).toBe(3);
  });

  it('getSkillStatesForLearner retrieves all skill states for a learner', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'state-1',
          learner_id: 'learner-1',
          skill_id: 'skill-1',
          mastery: 0.8,
          alpha: 8.0,
          beta: 2.0,
          evidence_count: 10,
          last_evidence_at: null,
          updated_at: new Date(),
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const states = await getSkillStatesForLearner('learner-1');
    expect(states).toHaveLength(1);
    expect(states[0].mastery).toBe(0.8);
  });

  it('getEvidenceEventsForLearner retrieves learner evidence event history', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'ev-1',
          learner_id: 'learner-1',
          attempt_id: 'att-1',
          skill_id: 'skill-1',
          evidence_type: 'practice',
          passed: true,
          score: 1.0,
          difficulty: 2,
          task_mode: 'debug',
          occurred_at: new Date(),
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const events = await getEvidenceEventsForLearner('learner-1');
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('ev-1');
  });
});
