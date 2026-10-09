import React from 'react';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { useLearner } from '../../state/LearnerContext.js';

export const ProgressHistory: React.FC = () => {
  const { state } = useLearner();

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px' }}>Progress History</h1>
            <p className="lead">Your engineering progression and verified mission attempts.</p>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginBottom: '48px' }}>
            {state.attempts.length === 0 ? (
              <div
                style={{
                  color: 'var(--muted)',
                  padding: '24px',
                  border: '1px dashed var(--border)',
                }}
              >
                No mission attempts recorded yet.
              </div>
            ) : (
              state.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  style={{
                    background: 'var(--s1)',
                    padding: '24px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div className="tl" style={{ color: 'var(--muted)' }}>
                        ATTEMPT {attempt.id.slice(-6)}
                      </div>
                      <h3 style={{ margin: '4px 0 0' }}>{attempt.missionId}</h3>
                    </div>
                    <div
                      className="tl"
                      style={{
                        color:
                          attempt.status === 'TRANSFER_COMPLETED' ? 'var(--ok)' : 'var(--text)',
                      }}
                    >
                      {attempt.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Started: {new Date(attempt.startedAt).toLocaleString()}
                    {attempt.completedAt &&
                      ` · Completed: ${new Date(attempt.completedAt).toLocaleString()}`}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Button variant="secondary" href="/dashboard">
              RETURN TO DASHBOARD
            </Button>
            <Button variant="primary" href="/missions">
              START NEW MISSION
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
};
