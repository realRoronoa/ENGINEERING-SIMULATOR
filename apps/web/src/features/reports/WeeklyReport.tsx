import React from 'react';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { useLearner } from '../../state/LearnerContext.js';

export const WeeklyReport: React.FC = () => {
  const { state } = useLearner();
  const attempts = state.attempts;
  const completed = attempts.filter(a => a.status === 'TRANSFER_COMPLETED');

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto' }}>
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="tl" style={{ marginBottom: '8px' }}>WEEK 1 REPORT</div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Weekly Engineering Summary</h1>
            </div>
            <Button variant="secondary" onClick={() => window.print()}>PRINT REPORT</Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '32px' }}>
            <div style={{ background: 'var(--s1)', padding: '24px' }}>
              <div className="tl" style={{ marginBottom: '8px' }}>PRACTICE TIME</div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--mono)', margin: '8px 0' }}>{completed.length > 0 ? '1.5h' : '0h'}</div>
            </div>
            <div style={{ background: 'var(--s1)', padding: '24px' }}>
              <div className="tl" style={{ marginBottom: '8px' }}>MISSIONS</div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--mono)', margin: '8px 0' }}>{completed.length}</div>
            </div>
            <div style={{ background: 'var(--s1)', padding: '24px' }}>
              <div className="tl" style={{ marginBottom: '8px' }}>SKILLS IMPROVED</div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--mono)', margin: '8px 0', color: 'var(--ok)' }}>{completed.length > 0 ? '2' : '0'}</div>
            </div>
          </div>

          <div style={{ background: 'var(--s1)', padding: '32px', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 24px' }}>Practice Analysis</h3>
            {completed.length > 0 ? (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px', color: 'var(--ok)' }}>Verified Strengths</h4>
                  <ul style={{ color: 'var(--text)', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                    <li>Strong understanding of concurrency issues (race conditions).</li>
                    <li>Ability to properly scope variables in asynchronous retry handlers.</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px', color: 'var(--inv)' }}>Areas for Improvement</h4>
                  <ul style={{ color: 'var(--muted)', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                    <li>Initial reliance on AI hints for discovering the re-entry flow.</li>
                    <li>Next step: Practice identifying recursive or re-entrant calls manually.</li>
                  </ul>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                No completed missions this week. Start a mission to generate data for your report.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Button variant="secondary" href="/dashboard">BACK TO DASHBOARD</Button>
            {completed.length > 0 && <Button variant="primary" href="/missions">CONTINUE PRACTICING</Button>}
          </div>
        </div>
      </Container>
    </>
  );
};
