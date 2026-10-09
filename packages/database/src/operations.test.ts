import { describe, it, expect, vi } from 'vitest';
import * as client from './client.js';
import {
  createFlag,
  getFlagById,
  getFlagsForLearner,
  createDispute,
  getDisputeByEvaluationId,
  getEvaluationDetails,
  getWeeklyReport,
  upsertWeeklyReport,
  computeWeeklyProgressSnapshot,
} from './operations.js';

describe('Operational & Reporting Database Layer (@engineering-simulator/database)', () => {
  it('createFlag inserts new problem flag', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'flag-123',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          type: 'incorrect-test',
          description: 'Hidden test asserts wrong return type',
          status: 'open',
          created_at: new Date(),
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const res = await createFlag({
      attemptId: 'att-1',
      learnerId: 'learner-1',
      type: 'incorrect-test',
      description: 'Hidden test asserts wrong return type',
    });

    expect(res.id).toBe('flag-123');
    expect(res.status).toBe('open');
    expect(res.type).toBe('incorrect-test');
  });

  it('getFlagById and getFlagsForLearner retrieve flagged items', async () => {
    vi.spyOn(client, 'query')
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'flag-123',
            attempt_id: 'att-1',
            learner_id: 'learner-1',
            type: 'unclear-instructions',
            description: 'Step 2 lacks detail',
            status: 'open',
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'flag-123',
            attempt_id: 'att-1',
            learner_id: 'learner-1',
            type: 'unclear-instructions',
            description: 'Step 2 lacks detail',
            status: 'open',
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

    const single = await getFlagById('flag-123');
    expect(single?.id).toBe('flag-123');

    const list = await getFlagsForLearner('learner-1');
    expect(list).toHaveLength(1);
  });

  it('createDispute inserts evaluation dispute', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'disp-456',
          evaluation_id: 'eval-1',
          learner_id: 'learner-1',
          reason: 'Correct patch was marked fail due to network timeout',
          evidence_description: 'Evaluator timed out after 5000ms',
          status: 'open',
          created_at: new Date(),
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const dispute = await createDispute({
      evaluationId: 'eval-1',
      learnerId: 'learner-1',
      reason: 'Correct patch was marked fail due to network timeout',
      evidenceDescription: 'Evaluator timed out after 5000ms',
    });

    expect(dispute.id).toBe('disp-456');
    expect(dispute.status).toBe('open');
  });

  it('getDisputeByEvaluationId and getEvaluationDetails return records', async () => {
    vi.spyOn(client, 'query')
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'eval-1',
            attempt_id: 'att-1',
            learner_id: 'learner-1',
            passed: false,
            score: 0.5,
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'disp-1',
            evaluation_id: 'eval-1',
            learner_id: 'learner-1',
            reason: 'disputed',
            evidence_description: 'details',
            status: 'open',
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

    const evalDetails = await getEvaluationDetails('eval-1');
    expect(evalDetails?.learner_id).toBe('learner-1');

    const dispute = await getDisputeByEvaluationId('eval-1');
    expect(dispute?.id).toBe('disp-1');
  });

  it('upsertWeeklyReport and getWeeklyReport persist and retrieve snapshot', async () => {
    vi.spyOn(client, 'query')
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'rep-1',
            learner_id: 'learner-1',
            week_of: '2026-10-05',
            summary: 'Great progress this week',
            data_snapshot: { attemptsCompleted: 3 },
            created_at: new Date(),
          },
        ],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'rep-1',
            learner_id: 'learner-1',
            week_of: '2026-10-05',
            summary: 'Great progress this week',
            data_snapshot: { attemptsCompleted: 3 },
            created_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

    const saved = await upsertWeeklyReport({
      learnerId: 'learner-1',
      weekOf: '2026-10-05',
      summary: 'Great progress this week',
      dataSnapshot: { attemptsCompleted: 3 },
    });
    expect(saved.summary).toBe('Great progress this week');

    const fetched = await getWeeklyReport('learner-1', '2026-10-05');
    expect(fetched?.id).toBe('rep-1');
  });

  it('computeWeeklyProgressSnapshot synthesizes progress metrics when report not cached', async () => {
    vi.spyOn(client, 'query')
      .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] }) // getWeeklyReport null
      .mockResolvedValueOnce({
        rows: [{ count: '4' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      }) // attemptsCompleted
      .mockResolvedValueOnce({
        rows: [{ count: '1' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      }) // transferTasksPassed
      .mockResolvedValueOnce({
        rows: [
          {
            skill_id: 'skill-db',
            skill_name: 'Database Query Design',
            mastery: 0.75,
            passed_count: '2',
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      }); // skillsRes

    const progress = await computeWeeklyProgressSnapshot('learner-1');
    expect(progress.attemptsCompleted).toBe(4);
    expect(progress.transferTasksPassed).toBe(1);
    expect(progress.skillsImproved).toContain('Database Query Design');
    expect(progress.masteryChanges).toHaveLength(1);
    expect(progress.summary).toContain('Completed 4 mission attempt(s)');
  });
});
