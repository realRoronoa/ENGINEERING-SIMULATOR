import React from 'react';
import { STEPS } from './missionDemoData.js';

export interface ProgressRailProps {
  stepIndex: number;
}

export const ProgressRail: React.FC<ProgressRailProps> = ({ stepIndex }) => {
  return (
    <div className="rail" id="rail" aria-live="polite">
      {STEPS.map((step, i) => {
        const isFailStep = i === 2 || i === 4; // FAILURE, REJECT AI
        const isOn = i === stepIndex;
        const isDone = i < stepIndex || stepIndex === STEPS.length;

        const classList = [isFailStep ? 'f' : '', isOn ? 'on' : '', isDone ? 'done' : '']
          .filter(Boolean)
          .join(' ');

        return (
          <span key={step} className={classList}>
            {i + 1} {step}
          </span>
        );
      })}
    </div>
  );
};
