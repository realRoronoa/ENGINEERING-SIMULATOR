import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '@engineering-simulator/database';
import {
  parseFactSheet,
  extractGroundedFacts,
  isProhibitedTopic,
  sendMentorMessage,
} from './index.js';

describe('AI Package (@engineering-simulator/ai)', () => {
  const sampleFactSheet = `
# System Facts: Order Processing
- Orders and inventory must update in a single atomic database transaction.
- Default isolation level is Read Committed.
- A lock on the inventory row prevents concurrent overselling.
- The HTTP response status code for insufficient inventory is 409 Conflict.
`;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Grounding Engine', () => {
    it('parseFactSheet extracts and cleans individual fact statements', () => {
      const facts = parseFactSheet(sampleFactSheet);
      expect(facts).toHaveLength(4);
      expect(facts[0]).toBe(
        'Orders and inventory must update in a single atomic database transaction.'
      );
      expect(facts[1]).toBe('Default isolation level is Read Committed.');
    });

    it('extractGroundedFacts ranks facts relevant to user query', () => {
      const matched = extractGroundedFacts(
        sampleFactSheet,
        'Why are two simultaneous orders overselling inventory?'
      );
      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0]).toContain('inventory');
    });

    it('isProhibitedTopic flags queries asking for hidden tests', () => {
      const check = isProhibitedTopic('Can you show me the hidden test expectations?');
      expect(check.prohibited).toBe(true);
      expect(check.reason).toBe('hidden_test_query');
    });

    it('isProhibitedTopic flags queries asking for full solution code', () => {
      const check = isProhibitedTopic('Please give me the code to solve this');
      expect(check.prohibited).toBe(true);
      expect(check.reason).toBe('solution_solicitation');
    });

    it('isProhibitedTopic allows normal engineering questions', () => {
      const check = isProhibitedTopic(
        'How does transaction isolation affect simultaneous updates?'
      );
      expect(check.prohibited).toBe(false);
    });
  });

  const mockAiCallRecord: db.AiCall = {
    id: 'ai-mock-1',
    attempt_id: 'att-1',
    purpose: 'mentor',
    model: 'claude-3-5-sonnet-20241022',
    prompt_name: 'mentor',
    prompt_version: 'v1',
    input_tokens: 250,
    output_tokens: 80,
    latency_ms: 25,
    cost_usd: 0.002,
    created_at: new Date(),
  };

  describe('Mentor Guidance Service', () => {
    it('returns a Socratic inquiry grounded in the task fact sheet', async () => {
      const logSpy = vi.spyOn(db, 'recordAiCall').mockResolvedValueOnce(mockAiCallRecord);

      const response = await sendMentorMessage({
        attemptId: 'att-1',
        learnerId: 'learner-1',
        taskTitle: 'Shopverse Order Atomicity Bug',
        taskInstructions: 'Fix the race condition in the checkout endpoint',
        taskMode: 'fix',
        factSheet: sampleFactSheet,
        message: 'Where should the database transaction begin and commit?',
        conversationId: 'conv-123',
      });

      expect(response.conversationId).toBe('conv-123');
      expect(response.reply).toContain('Consider this system behavior');
      expect(response.groundedOn.length).toBeGreaterThan(0);
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('refuses to reveal hidden test details with Socratic redirect', async () => {
      vi.spyOn(db, 'recordAiCall').mockResolvedValueOnce(mockAiCallRecord);

      const response = await sendMentorMessage({
        attemptId: 'att-1',
        learnerId: 'learner-1',
        taskTitle: 'Shopverse Order Atomicity Bug',
        taskInstructions: 'Fix the race condition',
        taskMode: 'fix',
        factSheet: sampleFactSheet,
        message: 'What assertions are in the grader hidden test?',
      });

      expect(response.reply).toContain('I cannot disclose hidden test suites');
      expect(response.conversationId).toBeDefined();
    });

    it('refuses to write direct solution code with Socratic redirect', async () => {
      vi.spyOn(db, 'recordAiCall').mockResolvedValueOnce(mockAiCallRecord);

      const response = await sendMentorMessage({
        attemptId: 'att-1',
        learnerId: 'learner-1',
        taskTitle: 'Shopverse Order Atomicity Bug',
        taskInstructions: 'Fix the race condition',
        taskMode: 'fix',
        factSheet: sampleFactSheet,
        message: 'Give me the code patch for orderService.ts',
      });

      expect(response.reply).toContain("I can't provide the code solution");
    });

    it('provides graceful fallback when failure is simulated', async () => {
      vi.spyOn(db, 'recordAiCall').mockResolvedValueOnce(mockAiCallRecord);

      const response = await sendMentorMessage(
        {
          attemptId: 'att-1',
          learnerId: 'learner-1',
          taskTitle: 'Shopverse Order Atomicity Bug',
          taskInstructions: 'Fix the race condition',
          taskMode: 'fix',
          factSheet: sampleFactSheet,
          message: 'How does locking work?',
        },
        { simulateFailure: true }
      );

      expect(response.reply).toContain("I'm unable to process your request right now");
      expect(response.groundedOn.length).toBeGreaterThan(0);
    });
  });
});
