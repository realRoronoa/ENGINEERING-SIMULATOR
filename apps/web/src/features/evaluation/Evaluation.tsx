import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { useLearner } from '../../state/LearnerContext.js';

export const Evaluation: React.FC = () => {
  const { missionId, attemptId } = useParams<{ missionId: string; attemptId: string }>();
  const navigate = useNavigate();
  const { state, updateState } = useLearner();
  const [evaluating, setEvaluating] = useState(true);

  useEffect(() => {
    // Simulate async evaluation delay
    const timer = setTimeout(() => {
      setEvaluating(false);

      const updatedAttempts = state.attempts.map((a) =>
        a.id === attemptId
          ? { ...a, status: 'EVALUATED' as const, completedAt: new Date().toISOString() }
          : a
      );
      updateState({ attempts: updatedAttempts });
    }, 2500);
    return () => clearTimeout(timer);
  }, [attemptId, state.attempts, updateState]);

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <div className="tl" style={{ marginBottom: '8px' }}>
              EVALUATION REPORT
            </div>
            <h1 style={{ fontSize: '32px', margin: 0 }}>
              {missionId} · Attempt {attemptId?.slice(-4)}
            </h1>
          </div>

          {evaluating ? (
            <div
              style={{
                padding: '64px',
                textAlign: 'center',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            >
              <div style={{ color: 'var(--inv)', marginBottom: '16px' }}>
                RUNNING VERIFICATION SUITE
              </div>
              <p className="mono" style={{ color: 'var(--muted)' }}>
                &gt; Analyzing patch semantics...
                <br />
                &gt; Running test suite (42/42)...
                <br />
                &gt; Evaluating diagnostic reasoning...
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '32px',
                }}
              >
                <div
                  style={{
                    background: 'var(--s1)',
                    padding: '24px',
                    border: '1px solid var(--ok)',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Code Correctness</h3>
                    <StatusBadge status="ok">PASS</StatusBadge>
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: '13px',
                      color: 'var(--muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div>✓ tests/retry.test.ts</div>
                    <div>✓ tests/payments.test.ts</div>
                    <div style={{ marginTop: '8px', color: 'var(--text)' }}>
                      All 42 tests passed deterministically.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--s1)',
                    padding: '24px',
                    border: '1px solid var(--ok)',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Engineering Judgment</h3>
                    <StatusBadge status="ok">VERIFIED</StatusBadge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    <ul style={{ paddingLeft: '16px', margin: 0 }}>
                      <li style={{ marginBottom: '4px' }}>
                        Correctly rejected invalid AI suggestion.
                      </li>
                      <li style={{ marginBottom: '4px' }}>
                        Identified race condition in retry handler.
                      </li>
                      <li>Implemented shared attempt budget.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  marginBottom: '32px',
                }}
              >
                <h3 style={{ margin: '0 0 16px' }}>Skill Updates</h3>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--s2)',
                    borderRadius: '4px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>Concurrency & Idempotency</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      +1 Evidence (Verification)
                    </div>
                  </div>
                  <div className="tl" style={{ color: 'var(--ok)' }}>
                    COMPETENT
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <Button variant="secondary" href="/dashboard">
                  BACK TO DASHBOARD
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/missions/${missionId}/viva/${attemptId}`)}
                >
                  PROCEED TO VIVA
                </Button>
              </div>
            </>
          )}
        </div>
      </Container>
    </>
  );
};
