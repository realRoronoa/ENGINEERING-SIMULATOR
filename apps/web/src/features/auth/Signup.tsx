import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useLearner();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    // Demo login overrides
    loginDemo(name, email);
    navigate('/onboarding');
  };

  return (
    <Container>
      <div style={{ maxWidth: 400, margin: '100px auto' }}>
        <h2 style={{ marginBottom: '8px' }}>Create Account</h2>
        <p className="lead" style={{ marginBottom: '24px' }}>
          Begin your verified engineering practice.
        </p>

        {error && <div style={{ color: 'var(--fail)', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginTop: '16px' }}>
            <Button variant="primary" type="submit" style={{ width: '100%', textAlign: 'center' }}>
              SIGN UP
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
          <p>
            Demo mode active. This creates a local session only.
            <br />
            <a href="/login" style={{ color: 'var(--ok)', textDecoration: 'none' }}>Already have an account?</a>
          </p>
        </div>
      </div>
    </Container>
  );
};
