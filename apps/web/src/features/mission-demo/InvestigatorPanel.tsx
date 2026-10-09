import React from 'react';
import { MessageItem } from './missionDemoMachine.js';
import { SUGGESTED_QUESTIONS, SuggestedQuestion } from './missionDemoData.js';

export interface InvestigatorPanelProps {
  currentFile: string;
  messages: MessageItem[];
  onSelectQuestion: (question: SuggestedQuestion) => void;
}

export const InvestigatorPanel: React.FC<InvestigatorPanelProps> = ({
  currentFile,
  messages,
  onSelectQuestion,
}) => {
  return (
    <div>
      <div className="pane-h tl" style={{ color: 'var(--ai)' }}>
        AI Investigator
      </div>
      <div className="ai-p">
        <div className="tl" id="ctx" style={{ fontSize: '10px' }}>
          Context: {currentFile}
        </div>
        <div className="msgs" id="msgs" aria-live="polite">
          {messages.map((m, idx) => {
            const messageClass = ['m', m.type ? m.type : ''].filter(Boolean).join(' ');
            return (
              <div key={idx} className={messageClass}>
                <span className="tl">{m.who}</span>
                <span dangerouslySetInnerHTML={{ __html: m.text }} />
              </div>
            );
          })}
        </div>
        <div className="q" id="q">
          {SUGGESTED_QUESTIONS.map((item, idx) => (
            <button key={idx} onClick={() => onSelectQuestion(item)}>
              › {item.question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
