import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';
import { useLearner } from '../../state/LearnerContext.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo, loadDemoFixture } = useLearner();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    // Demo login
    loginDemo('Demo User', email);
    navigate('/dashboard');
  };

  return (
    <Container>
      <div style={{ maxWidth: 400, margin: '100px auto' }}>
        <h2 style={{ marginBottom: '8px' }}>Log In</h2>
        <p className="lead" style={{ marginBottom: '24px' }}>
          Access your Engineering Simulator workspace.
        </p>

        {error && <div style={{ color: 'var(--fail)', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              LOG IN
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
          <p>
            Demo mode active. Any email/password will work.
            <br />
            <a href="/signup" style={{ color: 'var(--ok)', textDecoration: 'none' }}>Create an account</a> |{' '}
            <a href="/forgot-password" style={{ color: 'var(--text)', textDecoration: 'none' }}>Forgot password?</a>
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Want to see how it works without signing up?
          </p>
          <Button 
            variant="secondary" 
            onClick={(e) => {
              e.preventDefault();
              loadDemoFixture();
              navigate('/dashboard');
            }}
            style={{ width: '100%', textAlign: 'center' }}
          >
            EXPLORE DEMO ACCOUNT
          </Button>
        </div>
      </div>
    </Container>
  );
};
