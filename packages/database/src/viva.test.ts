import { describe, it, expect, vi } from 'vitest';
import * as client from './client.js';
import {
  createVivaRecord,
  getVivaRecordById,
  getVivaRecordByAttemptId,
  addVivaAnswer,
  completeVivaRecord,
} from './viva.js';

describe('Viva Database Layer (@engineering-simulator/database)', () => {
  const sampleQuestions = [
    {
      id: 'q-1',
      text: 'Explain why the race condition occurred in the previous implementation.',
      type: 'authored' as const,
    },
    {
      id: 'q-2',
      text: 'What are the performance implications of the locking strategy chosen?',
      type: 'authored' as const,
    },
  ];

  it('createVivaRecord inserts new viva record with status in-progress', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'viva-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          questions: sampleQuestions,
          answers: [],
          rubric_results: null,
          status: 'in-progress',
          started_at: new Date('2026-10-09T14:00:00Z'),
          completed_at: null,
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const record = await createVivaRecord('att-1', 'learner-1', sampleQuestions);
    expect(record.id).toBe('viva-1');
    expect(record.status).toBe('in-progress');
    expect(record.questions).toHaveLength(2);
    expect(record.answers).toEqual([]);
  });

  it('getVivaRecordById fetches viva by its ID', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'viva-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          questions: sampleQuestions,
          answers: [],
          status: 'in-progress',
          started_at: new Date(),
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const record = await getVivaRecordById('viva-1');
    expect(record?.id).toBe('viva-1');
  });

  it('getVivaRecordByAttemptId fetches latest viva record for attempt', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'viva-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          questions: sampleQuestions,
          answers: [],
          status: 'in-progress',
          started_at: new Date(),
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const record = await getVivaRecordByAttemptId('att-1');
    expect(record?.attempt_id).toBe('att-1');
  });

  it('addVivaAnswer appends answer to existing answers array', async () => {
    const querySpy = vi.spyOn(client, 'query');

    // 1st query: getVivaRecordById
    querySpy.mockResolvedValueOnce({
      rows: [
        {
          id: 'viva-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          questions: sampleQuestions,
          answers: [],
          status: 'in-progress',
          started_at: new Date(),
        },
      ],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    // 2nd query: update
    querySpy.mockResolvedValueOnce({
      rows: [
        {
          id: 'viva-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          questions: sampleQuestions,
          answers: [
            {
              questionId: 'q-1',
              answer: 'Because stock was checked without a lock or transaction.',
              submittedAt: '2026-10-09T14:05:00Z',
            },
          ],
          status: 'in-progress',
          started_at: new Date(),
        },
      ],
      command: 'UPDATE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const updated = await addVivaAnswer(
      'viva-1',
      'q-1',
      'Because stock was checked without a lock or transaction.'
    );

    expect(updated?.answers).toHaveLength(1);
    expect(updated?.answers[0].questionId).toBe('q-1');
  });

  it('completeVivaRecord marks status as complete and sets completed_at', async () => {
    vi.spyOn(client, 'query').mockResolvedValueOnce({
      rows: [
        {
          id: 'viva-1',
          attempt_id: 'att-1',
          learner_id: 'learner-1',
          questions: sampleQuestions,
          answers: [{ questionId: 'q-1', answer: 'Answer 1' }],
          rubric_results: { score: 1.0, feedback: 'Strong conceptual grasp' },
          status: 'complete',
          started_at: new Date(),
          completed_at: new Date(),
        },
      ],
      command: 'UPDATE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const completed = await completeVivaRecord('viva-1', {
      score: 1.0,
      feedback: 'Strong conceptual grasp',
    });

    expect(completed?.status).toBe('complete');
    expect(completed?.completed_at).toBeDefined();
    expect(completed?.rubric_results).toBeDefined();
  });
});
