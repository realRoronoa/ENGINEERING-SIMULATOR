import React from 'react';

export interface FileExplorerProps {
  currentFile: string;
  onOpenFile: (fileName: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ currentFile, onOpenFile }) => {
  return (
    <div className="col">
      <div className="pane-h tl">Files</div>
      <div className="tree" id="tree">
        <div>payments-service/</div>
        <div>&nbsp;&nbsp;src/</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;api/</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;payments/</div>
        <button
          className={`f ${currentFile === 'payment.service.ts' ? 'on' : ''}`}
          data-f="payment.service.ts"
          onClick={() => onOpenFile('payment.service.ts')}
        >
          payment.service.ts
        </button>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;retry/</div>
        <button
          className={`f ${currentFile === 'retry.ts' ? 'on' : ''}`}
          data-f="retry.ts"
          onClick={() => onOpenFile('retry.ts')}
        >
          retry.ts
        </button>
        <div>&nbsp;&nbsp;tests/</div>
        <button
          className={`f ${currentFile === 'retry.test.ts' ? 'on' : ''}`}
          data-f="retry.test.ts"
          onClick={() => onOpenFile('retry.test.ts')}
        >
          retry.test.ts
        </button>
        <div>&nbsp;&nbsp;package.json</div>
      </div>
      <div className="ticket">
        <span className="tl">TICKET-4412</span>
        <br />
        Payments return HTTP 500 during retry spikes. Investigate the failure and submit a verified
        fix.
      </div>
    </div>
  );
};
