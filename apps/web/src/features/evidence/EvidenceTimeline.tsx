import React, { useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export interface TimelineEvent {
  time: string;
  type: 'ok' | 'fail' | 'inv' | 'ai' | 'human';
  label: string;
  detailHtml: string;
}

export const EVIDENCE_EVENTS: TimelineEvent[] = [
  {
    time: '14:02',
    type: 'fail',
    label: 'FAILURE',
    detailHtml: 'Encountered HTTP 500 on <b>retry spike</b> test. 1 of 42 failing.',
  },
  {
    time: '14:04',
    type: 'inv',
    label: 'INSPECTION',
    detailHtml:
      'Opened <b>retry.ts</b>, then payment.service.ts. Followed stack frame retry.ts:11.',
  },
  {
    time: '14:06',
    type: 'ai',
    label: 'AI QUERY',
    detailHtml: 'Asked: "Why is this returning 500?" Context: 3 files, 1 test.',
  },
  {
    time: '14:08',
    type: 'fail',
    label: 'AI SUGGESTION REJECTED',
    detailHtml:
      'AI proposed raising max to 10. Candidate rejected it: <b>limit change hides the defect</b>.',
  },
  {
    time: '14:11',
    type: 'human',
    label: 'TEST ADDED',
    detailHtml: 'Added regression test: shared attempt budget per idempotency key.',
  },
  {
    time: '14:14',
    type: 'inv',
    label: 'ROOT CAUSE',
    detailHtml: 'Identified <b>race condition</b>: attempts reset on re-entry from charge().',
  },
  {
    time: '14:17',
    type: 'human',
    label: 'FIX APPLIED',
    detailHtml: 'Moved counter to atomic attemptStore keyed by idempotency key. 8 lines changed.',
  },
  {
    time: '14:18',
    type: 'ok',
    label: 'VERIFIED',
    detailHtml:
      '<b>42/42 tests passed.</b> Regression test green. Candidate wrote root-cause summary.',
  },
];

export const EvidenceTimeline: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(3);
  const selectedEvent = EVIDENCE_EVENTS[selectedIndex];

  return (
    <div className="ev">
      <div>
        <div className="tl">Engineering verification</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
          * Illustrative demo data
        </div>
        <div className="kv">
          <span>Candidate</span>
          <span className="mono">Jane Doe</span>
        </div>
        <div className="kv">
          <span>Mission</span>
          <span className="mono">Payment Retry Failure</span>
        </div>
        <div className="kv">
          <span>Complexity</span>
          <span className="mono">HIGH</span>
        </div>

        <div className="tl" style={{ marginTop: '20px' }}>
          Verification score
        </div>
        <div className="score">94</div>

        <div className="kv">
          <span>Root cause understanding</span>
          <StatusBadge status="ok">✓ VERIFIED</StatusBadge>
        </div>
        <div className="kv">
          <span>AI dependency</span>
          <StatusBadge status="ok">LOW</StatusBadge>
        </div>
        <div className="kv">
          <span>Testing discipline</span>
          <StatusBadge status="ok">✓ STRONG</StatusBadge>
        </div>
        <div className="kv">
          <span>Debugging</span>
          <StatusBadge status="ok">✓ STRONG</StatusBadge>
        </div>
        <div className="kv">
          <span>Verification</span>
          <StatusBadge status="ok">✓ VERIFIED</StatusBadge>
        </div>
        <div className="kv">
          <span>Ownership</span>
          <StatusBadge status="ok">HIGH</StatusBadge>
        </div>
      </div>

      <div>
        <div className="tl" style={{ marginBottom: '8px' }}>
          Investigation timeline
        </div>
        <div id="tli">
          {EVIDENCE_EVENTS.map((evt, idx) => (
            <button
              key={idx}
              className={`ti ${selectedIndex === idx ? 'on' : ''}`}
              onClick={() => setSelectedIndex(idx)}
            >
              <span className="t">{evt.time}</span>
              <span className={`dot ${evt.type}`} />
              <span>{evt.label}</span>
            </button>
          ))}
        </div>
        <div className="detail" id="det">
          <span className="tl">
            {selectedEvent.time} · {selectedEvent.label}
          </span>
          <br />
          <span dangerouslySetInnerHTML={{ __html: selectedEvent.detailHtml }} />
        </div>
      </div>
    </div>
  );
};
