export interface FileData {
  path: string;
  bug: string;
  fix?: string;
  hb?: number[]; // Highlighted bug lines
  hf?: number[]; // Highlighted fix lines
}

export const SRC: Record<string, FileData> = {
  'retry.ts': {
    path: 'src/retry/retry.ts',
    bug: `import { sleep } from '../util/time';
import { PaymentError } from '../payments/errors';

export async function withRetry<T>(key: string, fn: () => Promise<T>, max = 3) {
  // attempt count lives in this call frame
  let attempts = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (++attempts >= max) throw new PaymentError(500, 'Retry limit exceeded');
      await sleep(50 * 2 ** attempts);
    }
  }
}`,
    fix: `import { sleep } from '../util/time';
import { PaymentError } from '../payments/errors';
import { attemptStore } from './attempt-store';

export async function withRetry<T>(key: string, fn: () => Promise<T>, max = 3) {
  // attempts keyed by idempotency key, atomically incremented
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const n = await attemptStore.incr(key);
      if (n >= max) throw new PaymentError(409, 'Retry limit exceeded');
      await sleep(50 * 2 ** n);
    }
  }
}`,
    hb: [6],
    hf: [4, 5, 10, 11],
  },
  'payment.service.ts': {
    path: 'src/payments/payment.service.ts',
    bug: `import { withRetry } from '../retry/retry';
import { db } from '../database/pool';

export async function charge(req: ChargeRequest) {
  // handler re-enters charge() on 503 from gateway
  const key = req.idempotencyKey;
  return withRetry(key, async () => {
    const res = await gateway.post('/charge', req);
    if (res.status === 503) return charge(req); // re-entry
    await db.ledger.insert({ key, amount: req.amount });
    return res.data;
  });
}`,
    hb: [7, 9],
  },
  'retry.test.ts': {
    path: 'tests/retry.test.ts',
    bug: `import { withRetry } from '../src/retry/retry';

describe('retry under concurrent re-entry', () => {
  it('shares the attempt budget per idempotency key', async () => {
    const res = await simulateSpike({ key: 'k1', concurrency: 8 });
    expect(res.status).toBe(200);
  });
  it('stops after max attempts', async () => {
    await expect(withRetry('k2', alwaysFail, 3)).rejects.toThrow();
  });
});`,
    hb: [5, 6],
  },
};

export const STEPS = [
  'AI SUGGESTION',
  'TEST RUN',
  'FAILURE',
  'INVESTIGATE',
  'REJECT AI',
  'ROOT CAUSE',
  'FIX',
  '42/42 PASS',
  'SIGNAL',
];

export interface SuggestedQuestion {
  question: string;
  answer: string;
  evidence: string;
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    question: 'Why is this returning 500?',
    answer:
      'The retry handler appears to reset the attempt counter when the request is re-entered. I cannot confirm without payment.service.ts.',
    evidence: 'retry.ts, retry.test.ts · 1 stack frame',
  },
  {
    question: 'Is raising max safe?',
    answer:
      'Raising max only delays the 500 and may amplify load during spikes. Verify with the failing test first.',
    evidence: 'retry.test.ts · 1 test',
  },
  {
    question: 'Where is retry re-entered?',
    answer: 'payment.service.ts line 9 calls charge() on 503, which creates a new withRetry frame.',
    evidence: 'payment.service.ts · 2 stack frames',
  },
];
