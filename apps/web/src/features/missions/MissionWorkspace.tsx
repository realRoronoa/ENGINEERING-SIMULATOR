import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { MissionDemo } from '../mission-demo/MissionDemo.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';

export const MissionWorkspace: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { updateState, state } = useLearner();

  const handleSubmit = () => {
    // Record attempt
    const newAttempt = {
      id: `att-${Date.now()}`,
      missionId: missionId || 'm-unknown',
      status: 'SUBMITTED' as const,
      startedAt: new Date().toISOString()
    };
    updateState({ attempts: [...state.attempts, newAttempt] });
    
    // In a real app this would call an API, then redirect to evaluation
    navigate(`/missions/${missionId}/evaluation/${newAttempt.id}`);
  };

  return (
    <>
      <Navbar />
      <Container>
        <div style={{ marginTop: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="tl" style={{ marginBottom: '8px' }}>MISSION WORKSPACE</div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>{missionId === 'm-4412' ? 'TICKET-4412 · Payments Service' : missionId}</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" href="/missions">CANCEL</Button>
            <Button variant="primary" onClick={handleSubmit}>SUBMIT ATTEMPT</Button>
          </div>
        </div>

        <div style={{ marginBottom: '64px' }}>
          {/* We reuse the MissionDemo component as the workspace for now */}
          <MissionDemo />
        </div>
      </Container>
    </>
  );
};
