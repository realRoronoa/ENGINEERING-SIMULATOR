import React, { useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export interface CandidateRecord {
  name: string;
  mission: string;
  complexity: string;
  statusType: 'ok' | 'fail' | 'rev' | 'ai';
  statusText: string;
  metrics: [string, string, string, string]; // [Test behavior, AI interaction, Root cause, Timeline]
}

export const CANDIDATES: CandidateRecord[] = [
  {
    name: 'Jane Doe',
    mission: 'Retry Bug',
    complexity: 'HIGH',
    statusType: 'ok',
    statusText: '✓ 94',
    metrics: [
      '4 runs · 1 regression test',
      '3 queries · 1 rejected',
      'Race condition',
      '14 min · 8 events',
    ],
  },
  {
    name: 'John Smith',
    mission: 'Cache Bug',
    complexity: 'MEDIUM',
    statusType: 'rev',
    statusText: '! 62',
    metrics: [
      '2 runs · 0 new tests',
      '6 queries · 0 rejected',
      'Symptom only',
      '31 min · 12 events',
    ],
  },
  {
    name: 'Alex Kumar',
    mission: 'API Failure',
    complexity: 'HIGH',
    statusType: 'ok',
    statusText: '✓ 89',
    metrics: [
      '5 runs · 2 new tests',
      '2 queries · 1 rejected',
      'Timeout config + pool',
      '22 min · 9 events',
    ],
  },
];

const METRIC_LABELS = ['TEST BEHAVIOR', 'AI INTERACTION', 'ROOT CAUSE', 'TIMELINE'];

export const ReviewerTable: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCandidate = CANDIDATES[selectedIndex];

  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
        * Sample demonstration records
      </div>
      <div className="sc">
        <table className="tbl">
          <thead>
            <tr>
              <th>CANDIDATE</th>
              <th>MISSION</th>
              <th>COMPLEXITY</th>
              <th>VERIFICATION</th>
            </tr>
          </thead>
          <tbody id="rows">
            {CANDIDATES.map((cand, idx) => (
              <tr
                key={idx}
                className={`r ${selectedIndex === idx ? 'sel' : ''}`}
                tabIndex={0}
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelectedIndex(idx);
                }}
              >
                <td>{cand.name}</td>
                <td>{cand.mission}</td>
                <td>{cand.complexity}</td>
                <td>
                  <StatusBadge status={cand.statusType}>{cand.statusText}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mini" id="mini">
        {selectedCandidate.metrics.map((val, idx) => (
          <div key={idx}>
            {METRIC_LABELS[idx]}
            <b>{val}</b>
          </div>
        ))}
      </div>
    </div>
  );
};
