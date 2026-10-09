import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  getFileContent,
  getFailingTestOutput,
  getPassingTestOutput,
} from './missionDemoMachine.js';

describe('MissionDemoMachine', () => {
  it('creates initial state correctly', () => {
    const state = createInitialState();
    expect(state.currentFile).toBe('retry.ts');
    expect(state.fixed).toBe(false);
    expect(state.statusText).toBe('! IDLE');
    expect(state.signalAcquired).toBe(false);
  });

  it('gets correct file content for retry.ts in bug vs fix state', () => {
    const bugContent = getFileContent('retry.ts', false);
    expect(bugContent.lines.some((l) => l.includes('let attempts = 0'))).toBe(true);

    const fixContent = getFileContent('retry.ts', true);
    expect(fixContent.lines.some((l) => l.includes('attemptStore.incr'))).toBe(true);
  });

  it('returns appropriate failing and passing test output lines', () => {
    const failing = getFailingTestOutput();
    expect(failing.some((line) => line.text.includes('1 failed'))).toBe(true);

    const passing = getPassingTestOutput();
    expect(passing.some((line) => line.text.includes('42 passed'))).toBe(true);
  });
});
