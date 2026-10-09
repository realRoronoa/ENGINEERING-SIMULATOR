import React from 'react';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { useLearner } from '../../state/LearnerContext.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const Profile: React.FC = () => {
  const { state } = useLearner();
  const profile = state.profile;

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px' }}>Skill Profile</h1>
            <p className="lead">Verified engineering skills for {profile?.name}.</p>
          </div>

          <div style={{ display: 'grid', gap: '24px', marginBottom: '48px' }}>
            {profile?.skills.map((skill) => (
              <div
                key={skill.id}
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
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{skill.name}</h3>
                    <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {skill.evidenceCount} verified event{skill.evidenceCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <StatusBadge status={skill.level === 'NOVICE' ? 'fail' : 'ok'}>
                    {skill.level}
                  </StatusBadge>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div className="tl" style={{ marginBottom: '8px' }}>
                    EVIDENCE
                  </div>
                  {skill.evidenceCount > 1 ? (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '20px',
                        color: 'var(--muted)',
                        fontSize: '13px',
                      }}
                    >
                      <li style={{ marginBottom: '4px' }}>Diagnostic assessment (Simulated)</li>
                      <li style={{ marginBottom: '4px' }}>TICKET-4412 Mission execution</li>
                      <li style={{ marginBottom: '4px' }}>TICKET-4412 Viva defense</li>
                      <li>AI-OFF Independent transfer task</li>
                    </ul>
                  ) : (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '20px',
                        color: 'var(--muted)',
                        fontSize: '13px',
                      }}
                    >
                      <li>Diagnostic assessment (Simulated)</li>
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Button variant="secondary" href="/dashboard">
              BACK TO DASHBOARD
            </Button>
            <Button variant="secondary" href="/progress">
              VIEW PROGRESS HISTORY
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
};
