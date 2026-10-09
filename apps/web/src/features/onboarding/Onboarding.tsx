import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState } = useLearner();

  const [experience, setExperience] = useState(state.profile?.experienceLevel || '');
  const [goal, setGoal] = useState(state.profile?.goal || '');
  const [time, setTime] = useState(state.profile?.practiceTime || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.profile) {
      updateState({
        profile: {
          ...state.profile,
          experienceLevel: experience,
          goal,
          practiceTime: time,
        },
      });
    }
    navigate('/onboarding/diagnostic');
  };

  return (
    <Container>
      <div style={{ maxWidth: 500, margin: '64px auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="tl">STEP 1 OF 3</div>
          <h2 style={{ marginTop: '8px' }}>Set your baseline</h2>
          <p className="lead">
            Tell us about your background so we can recommend the right missions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text)',
                fontWeight: 500,
              }}
            >
              Current Experience Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="student">Student / Bootcamp</option>
              <option value="junior">Junior Engineer (0-2 years)</option>
              <option value="mid">Mid-level Engineer (2-5 years)</option>
              <option value="senior">Senior Engineer (5+ years)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text)',
                fontWeight: 500,
              }}
            >
              Primary Learning Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="backend_mastery">Master Backend Engineering</option>
              <option value="system_design">Improve System Design</option>
              <option value="interview_prep">Prepare for Interviews</option>
              <option value="just_curious">Just exploring</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text)',
                fontWeight: 500,
              }}
            >
              Weekly Practice Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="casual">1-2 hours / week</option>
              <option value="regular">3-5 hours / week</option>
              <option value="intensive">5+ hours / week</option>
            </select>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" type="submit">
              CONTINUE TO DIAGNOSTIC
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};
