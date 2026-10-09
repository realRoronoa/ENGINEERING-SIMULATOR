import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { useLearner } from '../../state/LearnerContext.js';

export const TransferTask: React.FC = () => {
  useParams();
  // Use taskId for telemetry in a real app, keeping it here to avoid stripping path params
  const navigate = useNavigate();
  const { updateState, state } = useLearner();
  const [selectedFix, setSelectedFix] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);

    // Find the current mission attempt and mark complete
    const updatedAttempts = state.attempts.map((a) => {
      if (a.status === 'VIVA_COMPLETED') {
        return { ...a, status: 'TRANSFER_COMPLETED' as const };
      }
      return a;
    });

    // Update skills based on correct answer (0 is correct here)
    const passed = selectedFix === 0;
    const currentSkills = state.profile?.skills || [];
    const updatedSkills = currentSkills.map((s) => {
      if (s.name === 'Concurrency & Idempotency') {
        return {
          ...s,
          level: passed ? ('PROFICIENT' as const) : s.level,
          evidenceCount: s.evidenceCount + (passed ? 2 : 1),
        };
      }
      return s;
    });

    if (state.profile) {
      updateState({
        attempts: updatedAttempts,
        profile: {
          ...state.profile,
          skills: updatedSkills,
        },
      });
    }
  };

  const handleFinish = () => {
    navigate('/progress');
  };

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto' }}>
          <div
            style={{
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div className="tl" style={{ marginBottom: '8px', color: 'var(--inv)' }}>
                AI OFF — INDEPENDENT VERIFICATION
              </div>
              <h1 style={{ fontSize: '28px', margin: 0 }}>Transfer Task</h1>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                background: 'var(--s1)',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px dashed var(--inv)',
              }}
            >
              No AI Investigator available.
            </div>
          </div>

          {submitted ? (
            <div
              style={{
                background: 'var(--s1)',
                padding: '32px',
                border: `1px solid ${selectedFix === 0 ? 'var(--ok)' : 'var(--fail)'}`,
                borderRadius: '6px',
              }}
            >
              <h3 style={{ margin: '0 0 16px' }}>
                Transfer {selectedFix === 0 ? 'Verified' : 'Failed'}
              </h3>
              <p style={{ color: 'var(--text)', marginBottom: '24px' }}>
                {selectedFix === 0
                  ? 'Correct. Using a distributed lock ensures the idempotency check is race-free across multiple instances.'
                  : 'Incorrect. While that handles local state, it does not prevent a race condition if two identical webhooks hit different server instances simultaneously.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleFinish}>
                  VIEW UPDATED PROFILE
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--s1)',
                padding: '32px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            >
              <p className="lead" style={{ marginTop: 0 }}>
                A third-party webhook occasionally double-delivers events within a 5-millisecond
                window. Our worker processes both events simultaneously, resulting in
                double-crediting a user's balance.
              </p>
              <p style={{ color: 'var(--text)', marginBottom: '24px' }}>
                Given a distributed, multi-instance worker environment, which fix correctly
                establishes idempotency?
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginBottom: '32px',
                }}
              >
                {[
                  'Acquire a distributed lock (e.g. Redis) on the webhook ID before processing, and store the result.',
                  'Keep a local in-memory Set of processed webhook IDs and check it before processing.',
                  'Add a random 500ms sleep before processing to ensure the first event finishes.',
                  'Catch the unique constraint violation from the database on the balance update.',
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFix(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '16px',
                      background: selectedFix === idx ? 'var(--s3)' : 'var(--s2)',
                      border: `1px solid ${selectedFix === idx ? 'var(--inv)' : 'var(--border)'}`,
                      color: 'var(--text)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleSubmit} disabled={selectedFix === null}>
                  SUBMIT TRANSFER DECISION
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};
