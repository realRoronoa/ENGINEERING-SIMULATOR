import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';
import { Skill } from '../../types/learner.js';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'When handling payment idempotency, where should the lock be acquired?',
    options: [
      'In the API gateway before routing.',
      'Around the database transaction inserting the payment record.',
      'In a Redis cache before calling the external payment provider.',
      'On the client side by disabling the submit button.',
    ],
    correctIdx: 2,
  },
  {
    id: 'q2',
    text: 'What is the primary risk of an infinite retry loop with exponential backoff on a 503 Service Unavailable response?',
    options: [
      'Stack overflow in the retry handler.',
      'Exhausting the connection pool or threads while waiting.',
      'The 503 response changing to a 404.',
      'The exponential backoff becoming negative.',
    ],
    correctIdx: 1,
  },
];

export const Diagnostic: React.FC = () => {
  const navigate = useNavigate();
  const { updateState, state } = useLearner();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const question = QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: idx }));
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate results and finish
      QUESTIONS.reduce((acc, q) => acc + (answers[q.id] === q.correctIdx ? 1 : 0), 0);

      const newSkills: Skill[] = [
        {
          id: 's1',
          name: 'Concurrency & Idempotency',
          level: answers['q1'] === QUESTIONS[0].correctIdx ? 'COMPETENT' : 'NOVICE',
          evidenceCount: 1,
        },
        {
          id: 's2',
          name: 'Resilience & Retries',
          level: answers['q2'] === QUESTIONS[1].correctIdx ? 'COMPETENT' : 'NOVICE',
          evidenceCount: 1,
        },
      ];

      if (state.profile) {
        updateState({
          diagnosticCompleted: true,
          profile: {
            ...state.profile,
            skills: newSkills,
          },
        });
      }
      navigate('/onboarding/results');
    }
  };

  return (
    <Container>
      <div style={{ maxWidth: 600, margin: '64px auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="tl">STEP 2 OF 3 · DIAGNOSTIC</div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '4px' }}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: '4px',
                  flex: 1,
                  background: i <= currentIdx ? 'var(--ok)' : 'var(--s3)',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--s1)',
            padding: '32px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px' }}>{question.text}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options.map((opt, idx) => {
              const isSelected = answers[question.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  style={{
                    textAlign: 'left',
                    padding: '16px',
                    background: isSelected ? 'rgba(61, 220, 132, 0.1)' : 'var(--s2)',
                    border: `1px solid ${isSelected ? 'var(--ok)' : 'var(--border)'}`,
                    color: 'var(--text)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentIdx(currentIdx - 1)}
              disabled={currentIdx === 0}
            >
              PREVIOUS
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={answers[question.id] === undefined}
            >
              {currentIdx === QUESTIONS.length - 1 ? 'SUBMIT DIAGNOSTIC' : 'NEXT'}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};
