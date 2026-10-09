import React from 'react';
import { SRC, FileData } from './missionDemoData.js';

export interface CodeViewerProps {
  fileKey: string;
  fixed: boolean;
  marks: string[];
  adds: boolean;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function highlightSyntax(s: string): string {
  return escapeHtml(s)
    .replace(/(\/\/.*)$/, '<span class="c">$1</span>')
    .replace(
      /\b(import|from|export|async|await|function|const|let|if|return|throw|new|try|catch|describe|it|expect)\b/g,
      '<span class="k">$1</span>'
    )
    .replace(/('[^']*')/g, '<span class="s">$1</span>');
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ fileKey, fixed, marks, adds }) => {
  const fileData: FileData = SRC[fileKey] || SRC['retry.ts'];
  const codeText = fixed && fileData.fix ? fileData.fix : fileData.bug;
  const lines = codeText.split('\n');

  const filePath = fileData.path;
  const hb = fileData.hb || [];
  const hf = fileData.hf || [];

  return (
    <div className="col">
      <div className="pane-h tl" id="fname">
        {filePath}
      </div>
      <div className="code" id="code" tabIndex={0}>
        {lines.map((lineText, index) => {
          const lineNum = index + 1;
          let highlightClass = '';

          if (fixed && hf.includes(lineNum) && adds) {
            highlightClass = 'add';
          } else if (marks.includes(`${fileKey}:hl`) && hb.includes(lineNum) && !fixed) {
            highlightClass = 'hl';
          } else if (marks.includes(`${fileKey}:bad`) && hb.includes(lineNum)) {
            highlightClass = 'bad';
          }

          const highlightedContent = highlightSyntax(lineText);

          return (
            <div key={lineNum} className={`ln ${highlightClass}`}>
              <b>{lineNum}</b>
              <span dangerouslySetInnerHTML={{ __html: highlightedContent || ' ' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
