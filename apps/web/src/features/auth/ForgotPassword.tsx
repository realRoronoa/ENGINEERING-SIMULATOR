import React, { useState } from 'react';
import { Container } from '../../components/ui/Container.js';
import { Button } from '../../components/ui/Button.js';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Container>
      <div style={{ maxWidth: 400, margin: '100px auto' }}>
        <h2 style={{ marginBottom: '8px' }}>Reset Password</h2>

        {submitted ? (
          <div
            style={{
              padding: '16px',
              background: 'rgba(61, 220, 132, 0.1)',
              border: '1px solid var(--ok)',
              color: 'var(--text)',
            }}
          >
            If an account exists for {email}, a password reset link has been sent.
            <div style={{ marginTop: '16px' }}>
              <Button href="/login">RETURN TO LOGIN</Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <p className="lead" style={{ marginBottom: '8px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>
                Email
              </label>
              <input
                type="email"
                required
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
            <div style={{ marginTop: '16px' }}>
              <Button
                variant="primary"
                type="submit"
                style={{ width: '100%', textAlign: 'center' }}
              >
                SEND RESET LINK
              </Button>
            </div>
          </form>
        )}
      </div>
    </Container>
  );
};
