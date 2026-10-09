import { SRC, FileData } from './missionDemoData.js';

export interface MessageItem {
  who: string;
  text: string;
  type?: 'ai' | 'rej' | 'human';
}

export interface TerminalLine {
  text: string;
  style?: 'f' | 'p' | 'i' | 'd' | '';
}

export interface DemoState {
  currentFile: string;
  fixed: boolean;
  marks: string[];
  adds: boolean;
  stepIndex: number;
  statusText: string;
  statusType: 'ok' | 'fail' | 'rev' | 'ai';
  messages: MessageItem[];
  terminalOutput: TerminalLine[];
  signalAcquired: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  isPlaying: boolean;
  runToken: number;
}

export function createInitialState(): DemoState {
  return {
    currentFile: 'retry.ts',
    fixed: false,
    marks: [],
    adds: false,
    stepIndex: -1,
    statusText: '! IDLE',
    statusType: 'rev',
    messages: [
      {
        who: 'Candidate',
        text: 'Starting on TICKET-4412. Reading retry.ts.',
        type: 'human',
      },
    ],
    terminalOutput: [
      { text: 'sandbox ready · repo mounted · network: isolated', style: 'd' },
      { text: '$ ', style: 'd' },
    ],
    signalAcquired: false,
    startTime: null,
    elapsedSeconds: 0,
    isPlaying: false,
    runToken: 0,
  };
}

export function getFileContent(
  fileKey: string,
  fixed: boolean
): { lines: string[]; data: FileData } {
  const data = SRC[fileKey] || SRC['retry.ts'];
  const codeText = fixed && data.fix ? data.fix : data.bug;
  return {
    lines: codeText.split('\n'),
    data,
  };
}

export function getFailingTestOutput(): TerminalLine[] {
  return [
    { text: '$ npm test', style: 'd' },
    { text: '> jest --runInBand', style: '' },
    { text: 'FAIL  tests/retry.test.ts', style: 'f' },
    {
      text: '  ● retry under concurrent re-entry › shares the attempt budget',
      style: 'f',
    },
    { text: '    Expected: 200', style: 'f' },
    { text: '    Received: 500   Retry limit exceeded', style: 'f' },
    { text: '      at withRetry (src/retry/retry.ts:11:35)', style: 'd' },
    { text: '      at charge (src/payments/payment.service.ts:9:12)', style: 'd' },
    { text: 'Tests:  1 failed, 41 passed, 42 total  ✕', style: 'f' },
  ];
}

export function getPassingTestOutput(): TerminalLine[] {
  return [
    { text: '$ npm test', style: 'd' },
    { text: '> jest --runInBand', style: '' },
    { text: 'PASS  tests/retry.test.ts', style: 'p' },
    { text: 'PASS  tests/payments.test.ts', style: 'p' },
    { text: 'PASS  tests/api.test.ts', style: 'p' },
    { text: '', style: '' },
    { text: 'Tests:  42 passed, 42 total  ✓', style: 'p' },
  ];
}
