import crypto from 'node:crypto';
import { recordAiCall } from '@engineering-simulator/database';
import type { MentorRequestPayload, MentorResponsePayload } from '../types.js';
import { MENTOR_PROMPT_NAME, MENTOR_PROMPT_VERSION } from '../prompts/mentor-v1.js';

import { extractGroundedFacts, isProhibitedTopic } from './grounding.js';

export interface MentorOptions {
  model?: string;
  simulateFailure?: boolean;
}

export async function sendMentorMessage(
  payload: MentorRequestPayload,
  options: MentorOptions = {}
): Promise<MentorResponsePayload> {
  const startTime = Date.now();
  const conversationId = payload.conversationId || crypto.randomUUID();
  const model = options.model || 'claude-3-5-sonnet-20241022';

  // 1. Check for intentional failure simulation or missing critical data
  if (options.simulateFailure) {
    const fallbackFacts = extractGroundedFacts(payload.factSheet, payload.message);
    const latency = Date.now() - startTime;
    await safeLogAiCall({
      attempt_id: payload.attemptId,
      purpose: 'mentor',
      model,
      prompt_name: MENTOR_PROMPT_NAME,
      prompt_version: MENTOR_PROMPT_VERSION,
      input_tokens: 200,
      output_tokens: 40,
      latency_ms: latency,
      cost_usd: 0.001,
    });
    return {
      reply:
        "I'm unable to process your request right now. Try consulting the hint ladder or reviewing the system invariants.",
      conversationId,
      groundedOn: fallbackFacts,
    };
  }

  // 2. Extract verified grounding facts from task fact sheet
  const groundedFacts = extractGroundedFacts(payload.factSheet, payload.message);

  // 3. Check for prohibited topics (hidden tests or direct solution solicitation)
  const prohibitedCheck = isProhibitedTopic(payload.message);
  let reply: string;

  if (prohibitedCheck.prohibited) {
    if (prohibitedCheck.reason === 'hidden_test_query') {
      reply =
        'I cannot disclose hidden test suites or automated evaluation internals. What observable behavior or invariants from the fact sheet can you test directly?';
    } else {
      reply =
        "As your mentor, I can't provide the code solution or patch directly. Let's work through the root cause: what happens to the system state during that operation?";
    }
  } else {
    // 4. Formulate Socratic inquiry grounded in verified facts
    const primaryFact = groundedFacts[0] || 'System invariants and transaction boundaries';
    reply = `Consider this system behavior: "${primaryFact}". How does your current implementation handle this invariant when executing this request?`;
  }

  const latency = Date.now() - startTime;

  // 5. Audit log AI usage to ai_calls table
  await safeLogAiCall({
    attempt_id: payload.attemptId,
    purpose: 'mentor',
    model,
    prompt_name: MENTOR_PROMPT_NAME,
    prompt_version: MENTOR_PROMPT_VERSION,
    input_tokens: 250,
    output_tokens: 80,
    latency_ms: latency,
    cost_usd: 0.002,
  });

  return {
    reply,
    conversationId,
    groundedOn: groundedFacts,
  };
}

async function safeLogAiCall(data: Parameters<typeof recordAiCall>[0]): Promise<void> {
  try {
    await recordAiCall(data);
  } catch (err: unknown) {
    // AI call logging must never crash the learner flow
    console.warn('Failed to record AI call audit entry:', err);
  }
}
