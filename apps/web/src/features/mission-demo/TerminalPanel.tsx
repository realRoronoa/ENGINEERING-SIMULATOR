import React, { useState } from 'react';
import { TerminalLine } from './missionDemoMachine.js';

export interface TerminalPanelProps {
  output: TerminalLine[];
  onCommandSubmit: (cmd: string) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ output, onCommandSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setInputValue('');
    if (trimmed) {
      onCommandSubmit(trimmed);
    }
  };

  return (
    <div className="term">
      <div className="pane-h tl">Terminal</div>
      <div className="out" id="out" role="log">
        {output.map((line, idx) => (
          <div key={idx} className={line.style || ''}>
            {line.text}
          </div>
        ))}
      </div>
      <form className="cmd" id="cmd" onSubmit={handleSubmit}>
        <span style={{ color: 'var(--ok)' }}>$</span>
        <input
          id="in"
          autoComplete="off"
          spellCheck="false"
          aria-label="Terminal command"
          placeholder="type: npm test"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </form>
    </div>
  );
};
