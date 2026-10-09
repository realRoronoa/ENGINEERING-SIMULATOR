import React from 'react';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

const DEMO_MISSIONS = [
  {
    id: 'm-4412',
    title: 'TICKET-4412 · Payments Service',
    objective: 'Fix idempotency key collision under concurrent retry load.',
    duration: '25m',
    difficulty: 'Medium',
    skills: ['Concurrency & Idempotency', 'Resilience & Retries'],
    status: 'AVAILABLE'
  },
  {
    id: 'm-4413',
    title: 'TICKET-4413 · Checkout API',
    objective: 'Resolve race condition in cart total calculation.',
    duration: '45m',
    difficulty: 'Hard',
    skills: ['Data Consistency', 'Transactions'],
    status: 'LOCKED',
    prereq: 'Requires Competent in Concurrency'
  }
];

export const MissionsLibrary: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container>
        <div style={{ marginTop: '48px', marginBottom: '64px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px' }}>Mission Library</h1>
            <p className="lead">Select a verified engineering mission to practice and demonstrate your skills.</p>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {DEMO_MISSIONS.map(m => (
              <div key={m.id} style={{ 
                background: 'var(--s1)', 
                border: '1px solid var(--border)', 
                borderRadius: '6px', 
                padding: '24px',
                opacity: m.status === 'LOCKED' ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                      <StatusBadge status={m.status === 'LOCKED' ? 'fail' : 'ok'}>{m.status}</StatusBadge>
                      <span className="tl">{m.difficulty} · {m.duration}</span>
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{m.title}</h3>
                    <p style={{ color: 'var(--muted)', margin: 0 }}>{m.objective}</p>
                  </div>
                  {m.status !== 'LOCKED' && (
                    <Button variant="primary" href={`/missions/${m.id}`}>START MISSION</Button>
                  )}
                </div>
                
                {m.prereq && <div style={{ fontSize: '12px', color: 'var(--fail)', marginBottom: '12px' }}>🔒 {m.prereq}</div>}

                <div style={{ display: 'flex', gap: '8px' }}>
                  {m.skills.map(s => (
                    <span key={s} style={{ 
                      fontSize: '11px', 
                      background: 'var(--s2)', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      border: '1px solid var(--border)',
                      color: 'var(--muted)'
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
};
