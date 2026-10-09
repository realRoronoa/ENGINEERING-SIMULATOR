import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/Button.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { ProgressRail } from './ProgressRail.js';
import { FileExplorer } from './FileExplorer.js';
import { CodeViewer } from './CodeViewer.js';
import { InvestigatorPanel } from './InvestigatorPanel.js';
import { TerminalPanel } from './TerminalPanel.js';
import { VerificationSignal } from './VerificationSignal.js';
import {
  createInitialState,
  DemoState,
  getFailingTestOutput,
  getPassingTestOutput,
} from './missionDemoMachine.js';
import { SRC, SuggestedQuestion } from './missionDemoData.js';

export const MissionDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>(createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const updateState = useCallback((updater: Partial<DemoState>) => {
    setState((prev) => ({ ...prev, ...updater }));
  }, []);

  const handleReset = useCallback(() => {
    setState((prev) => ({
      ...createInitialState(),
      runToken: prev.runToken + 1,
    }));
  }, []);

  const runTest = useCallback(
    async (token: number) => {
      updateState({
        statusText: '! RUNNING',
        statusType: 'rev',
      });
      setState((prev) => ({
        ...prev,
        terminalOutput: [...prev.terminalOutput, { text: '$ npm test', style: 'd' }],
      }));

      const lines = stateRef.current.fixed ? getPassingTestOutput() : getFailingTestOutput();

      for (const item of lines) {
        if (stateRef.current.runToken !== token) return;
        await sleep(220);
        setState((prev) => ({
          ...prev,
          terminalOutput: [...prev.terminalOutput, item],
        }));
      }

      if (stateRef.current.runToken !== token) return;
      const isFixed = stateRef.current.fixed;
      updateState({
        statusText: isFixed ? '✓ VERIFIED' : '✕ FAILED',
        statusType: isFixed ? 'ok' : 'fail',
      });
    },
    [updateState]
  );

  const handlePlay = useCallback(async () => {
    handleReset();
    await sleep(50); // yield so reset state lands
    const token = stateRef.current.runToken + 1;
    updateState({ runToken: token, isPlaying: true, startTime: Date.now() });

    const isCancelled = () => stateRef.current.runToken !== token;
    const wait = async (ms: number) => {
      await sleep(ms);
      return !isCancelled();
    };

    // Step 0: AI SUGGESTION
    updateState({ stepIndex: 0, statusText: '! INVESTIGATING', statusType: 'rev' });
    if (!(await wait(900))) return;

    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          who: 'AI Investigator',
          text: 'Likely cause: <b>maxAttempts</b> too low for spike traffic. Suggested fix: raise <span class="mono">max</span> from 3 to 10.',
          type: 'ai',
        },
      ],
      marks: ['retry.ts:hl'],
    }));
    if (!(await wait(1800))) return;

    // Step 1: TEST RUN
    updateState({ stepIndex: 1 });
    await runTest(token);
    if (isCancelled()) return;

    // Step 2: FAILURE
    updateState({ stepIndex: 2 });
    if (!(await wait(1200))) return;

    // Step 3: INVESTIGATE
    setState((prev) => ({
      ...prev,
      stepIndex: 3,
      currentFile: 'payment.service.ts',
      marks: ['payment.service.ts:hl'],
      messages: [
        ...prev.messages,
        {
          who: 'Candidate',
          text: 'Still 500 with a higher limit would hide it. Where is the counter shared?',
          type: 'human',
        },
      ],
      terminalOutput: [
        ...prev.terminalOutput,
        { text: '$ cat src/payments/payment.service.ts', style: 'd' },
      ],
    }));
    if (!(await wait(2200))) return;

    // Step 4: REJECT AI
    setState((prev) => ({
      ...prev,
      stepIndex: 4,
      messages: [
        ...prev.messages,
        {
          who: 'Candidate',
          text: 'Rejecting suggestion: charge() re-enters withRetry, so attempts resets each time.',
          type: 'rej',
        },
      ],
    }));
    if (!(await wait(1800))) return;

    // Step 5: ROOT CAUSE
    setState((prev) => ({
      ...prev,
      stepIndex: 5,
      currentFile: 'retry.ts',
      marks: ['retry.ts:hl'],
      statusText: '! ROOT CAUSE',
      statusType: 'rev',
      messages: [
        ...prev.messages,
        {
          who: 'Candidate',
          text: 'Root cause: per-frame counter + re-entry race. Budget must be shared per idempotency key.',
          type: 'human',
        },
      ],
    }));
    if (!(await wait(2200))) return;

    // Step 6: FIX
    setState((prev) => ({
      ...prev,
      stepIndex: 6,
      fixed: true,
      adds: true,
      marks: [],
      terminalOutput: [
        ...prev.terminalOutput,
        { text: '$ edit src/retry/retry.ts  (+attemptStore.incr(key))', style: 'd' },
      ],
    }));
    if (!(await wait(1600))) return;

    // Step 7: 42/42 PASS
    updateState({ stepIndex: 7 });
    await runTest(token);
    if (isCancelled()) return;

    // Step 8: SIGNAL
    updateState({ stepIndex: 8, signalAcquired: true, isPlaying: false });
  }, [handleReset, runTest, updateState]);

  const handleOpenFile = (fileName: string) => {
    updateState({ currentFile: fileName });
  };

  const handleSelectQuestion = (q: SuggestedQuestion) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { who: 'Candidate', text: q.question, type: 'human' }],
    }));

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            who: 'AI Investigator',
            text: `${q.answer}<br><span class="tl">Evidence used: ${q.evidence}</span>`,
            type: 'ai',
          },
        ],
      }));
    }, 500);
  };

  const handleCommandSubmit = (cmd: string) => {
    if (cmd === 'npm test') {
      const token = stateRef.current.runToken + 1;
      updateState({ runToken: token });
      runTest(token);
    } else if (cmd === 'clear') {
      updateState({ terminalOutput: [] });
    } else {
      setState((prev) => ({
        ...prev,
        terminalOutput: [
          ...prev.terminalOutput,
          { text: `$ ${cmd}`, style: 'd' },
          {
            text: 'sh: only `npm test` and `clear` are available in this prototype',
            style: 'i',
          },
        ],
      }));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (stateRef.current.startTime && !stateRef.current.signalAcquired) {
        const secs = Math.floor((Date.now() - stateRef.current.startTime) / 1000);
        updateState({ elapsedSeconds: secs });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [updateState]);

  const minutes = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(state.elapsedSeconds % 60).padStart(2, '0');
  const clockFormatted = `${minutes}:${seconds}`;

  const currentFilePath = SRC[state.currentFile]?.path || state.currentFile;

  return (
    <>
      <div className="ide" id="mission" aria-label="Simulated mission IDE">
        <div className="bar">
          <span className="tl" style={{ color: 'var(--text)' }}>
            TICKET-4412
          </span>
          <span className="tl">payments-service</span>
          <span className="tl mono" id="clock">
            {clockFormatted}
          </span>
          <div className="sp">
            <Button size="sm" onClick={handlePlay}>
              ▶ PLAY MISSION
            </Button>
            <Button size="sm" onClick={handleReset}>
              RESET
            </Button>
            <StatusBadge status={state.statusType}>{state.statusText}</StatusBadge>
          </div>
        </div>

        <ProgressRail stepIndex={state.stepIndex} />

        <div className="grid">
          <FileExplorer currentFile={state.currentFile} onOpenFile={handleOpenFile} />
          <CodeViewer
            fileKey={state.currentFile}
            fixed={state.fixed}
            marks={state.marks}
            adds={state.adds}
          />
          <InvestigatorPanel
            currentFile={currentFilePath}
            messages={state.messages}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>

        <TerminalPanel output={state.terminalOutput} onCommandSubmit={handleCommandSubmit} />

        <VerificationSignal active={state.signalAcquired} />
      </div>

      <div className="mobile">
        <div className="tl">MISSION IDE</div>
        <p>Best experienced on a desktop or laptop.</p>
        <Button href="#problem">RETURN TO OVERVIEW</Button>
      </div>
    </>
  );
};
