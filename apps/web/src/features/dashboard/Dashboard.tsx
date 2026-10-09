import React from 'react';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';
import { Navbar } from '../../components/layout/Navbar.js';

export const Dashboard: React.FC = () => {
  const { state } = useLearner();
  const profile = state.profile;
  const inProgress = state.attempts.find(a => a.status === 'IN_PROGRESS');

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ marginTop: '48px', marginBottom: '64px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px' }}>Welcome back, {profile?.name || 'Engineer'}</h1>
            <p className="lead">Goal: {profile?.goal ? profile.goal.replace('_', ' ') : 'Engineering Practice'}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            <div>
              <section style={{ padding: '0', border: 0, marginBottom: '48px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Current Mission
                </h3>
                {inProgress ? (
                  <div style={{ background: 'var(--s1)', padding: '24px', border: '1px solid var(--inv)', borderRadius: '6px' }}>
                    <div className="tl" style={{ color: 'var(--inv)', marginBottom: '8px' }}>IN PROGRESS</div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '18px' }}>TICKET-4412 · Payments Service</h4>
                    <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                      Fix idempotency key collision under concurrent retry load.
                    </p>
                    <Button variant="primary" href="/missions/m-4412">RESUME MISSION</Button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--s1)', padding: '24px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <div className="tl" style={{ color: 'var(--ok)', marginBottom: '8px' }}>RECOMMENDED</div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '18px' }}>TICKET-4412 · Payments Service</h4>
                    <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                      Master retry mechanisms and idempotency safely. Estimated time: 25m.
                    </p>
                    <Button variant="primary" href="/missions/m-4412">START MISSION</Button>
                  </div>
                )}
              </section>

              <section style={{ padding: '0', border: 0 }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Skill Progress
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {profile?.skills.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--s1)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.evidenceCount} verified events</div>
                      </div>
                      <div className="tl" style={{ color: s.level === 'COMPETENT' ? 'var(--ok)' : 'var(--text)' }}>
                        {s.level}
                      </div>
                    </div>
                  ))}
                  {(!profile?.skills || profile.skills.length === 0) && (
                    <div style={{ color: 'var(--muted)', padding: '16px', border: '1px dashed var(--border)' }}>
                      No skills assessed yet. Complete a diagnostic or mission.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div>
              <section style={{ padding: '0', border: 0, marginBottom: '32px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Activity
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  <p>Weekly Practice: 0h / {profile?.practiceTime === 'casual' ? '2h' : '5h'}</p>
                  <p>Missions Completed: {state.attempts.filter(a => a.status === 'TRANSFER_COMPLETED').length}</p>
                  <Button size="sm" href="/reports/weekly" style={{ marginTop: '12px' }}>VIEW WEEKLY REPORT</Button>
                </div>
              </section>
              <section style={{ padding: '0', border: 0 }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Quick Links
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="/missions" style={{ color: 'var(--text)', textDecoration: 'none' }}>Mission Library →</a>
                  <a href="/profile" style={{ color: 'var(--text)', textDecoration: 'none' }}>Skill Profile →</a>
                  <a href="/progress" style={{ color: 'var(--text)', textDecoration: 'none' }}>Progress History →</a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};
