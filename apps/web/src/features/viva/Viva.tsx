import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { useLearner } from '../../state/LearnerContext.js';

const VIVA_QUESTIONS = [
  'Can you explain why raising the `maxAttempts` limit in the original code did not fix the 500 error?',
  'If the payment gateway returned a 429 Too Many Requests instead of 503, would your fix still be appropriate? Why or why not?',
];

export const Viva: React.FC = () => {
  const { missionId, attemptId } = useParams<{ missionId: string; attemptId: string }>();
  const navigate = useNavigate();
  const { updateState, state } = useLearner();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = answer;
    setAnswers(newAnswers);

    if (currentIdx < VIVA_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswer(newAnswers[currentIdx + 1] || '');
    } else {
      setSubmitted(true);
      const updatedAttempts = state.attempts.map((a) =>
        a.id === attemptId ? { ...a, status: 'VIVA_COMPLETED' as const } : a
      );
      updateState({ attempts: updatedAttempts });
    }
  };

  const handleFinish = () => {
    navigate(`/transfer/t-${missionId}`);
  };

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 700, margin: '64px auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <div className="tl" style={{ marginBottom: '8px' }}>
              VIVA INTERVIEW
            </div>
            <h1 style={{ fontSize: '28px', margin: 0 }}>Mission Defense</h1>
            <p className="lead" style={{ marginTop: '8px' }}>
              Explain your reasoning and defend your implementation decisions.
            </p>
          </div>

          {submitted ? (
            <div
              style={{
                background: 'var(--s1)',
                padding: '32px',
                border: '1px solid var(--ok)',
                borderRadius: '6px',
              }}
            >
              <h3 style={{ margin: '0 0 16px' }}>Viva Completed</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                Your reasoning has been recorded as evidence. You demonstrated clear understanding
                of the re-entry race condition.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleFinish}>
                  PROCEED TO TRANSFER TASK
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
              <div className="tl" style={{ marginBottom: '16px' }}>
                QUESTION {currentIdx + 1} OF {VIVA_QUESTIONS.length}
              </div>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px' }}>{VIVA_QUESTIONS[currentIdx]}</h3>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your explanation..."
                style={{
                  width: '100%',
                  height: '150px',
                  padding: '16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--sans)',
                  fontSize: '14px',
                  borderRadius: '4px',
                  resize: 'vertical',
                }}
              />

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCurrentIdx(currentIdx - 1);
                    setAnswer(answers[currentIdx - 1] || '');
                  }}
                  disabled={currentIdx === 0}
                >
                  PREVIOUS
                </Button>
                <Button variant="primary" onClick={handleNext} disabled={answer.trim().length < 10}>
                  {currentIdx === VIVA_QUESTIONS.length - 1 ? 'SUBMIT DEFENSE' : 'NEXT QUESTION'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};
