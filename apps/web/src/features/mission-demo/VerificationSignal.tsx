import React from 'react';

export interface VerificationSignalProps {
  active: boolean;
}

export const VerificationSignal: React.FC<VerificationSignalProps> = ({ active }) => {
  return (
    <div className={`signal ${active ? 'on' : ''}`} id="sig">
      <span>✓ [SIGNAL ACQUIRED] SYSTEM DEBUGGING VERIFIED</span>
      <span>42/42 TESTS · AI SUGGESTION REJECTED · ROOT CAUSE: RACE CONDITION</span>
    </div>
  );
};
