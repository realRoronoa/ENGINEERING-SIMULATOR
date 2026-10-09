import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const DiagnosticResults: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState } = useLearner();

  const handleFinish = () => {
    updateState({ onboardingCompleted: true });
    navigate('/dashboard');
  };

  const skills = state.profile?.skills || [];

  return (
    <Container>
      <div style={{ maxWidth: 600, margin: '64px auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="tl">STEP 3 OF 3 · RESULTS</div>
          <h2 style={{ marginTop: '8px' }}>Initial Skill Profile</h2>
          <p className="lead">
            Based on your diagnostic, we've calibrated your starting skill levels.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '48px' }}>
          {skills.map((skill) => (
            <div
              key={skill.id}
              style={{
                background: 'var(--s1)',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{skill.name}</h3>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>1 piece of evidence</div>
              </div>
              <StatusBadge status={skill.level === 'COMPETENT' ? 'ok' : 'fail'}>
                {skill.level}
              </StatusBadge>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'rgba(61, 220, 132, 0.05)',
            padding: '24px',
            border: '1px solid var(--ok)',
            borderRadius: '6px',
            marginBottom: '32px',
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>Recommended Starting Point</h3>
          <p style={{ color: 'var(--text)', margin: '0 0 16px' }}>
            Mission: <b>TICKET-4412 (Payments Service)</b>
            <br />
            Focus: Resilient retry mechanisms under concurrent load.
          </p>
          <Button variant="primary" onClick={handleFinish}>
            GO TO DASHBOARD
          </Button>
        </div>
      </div>
    </Container>
  );
};
