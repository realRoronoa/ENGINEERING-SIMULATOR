import React from 'react';
import { Container } from '../components/ui/Container.js';
import { Navbar } from '../components/layout/Navbar.js';
import { Footer } from '../components/layout/Footer.js';

export const Terms: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto', paddingBottom: '64px' }}>
          <h1>Terms of Service</h1>
          <p className="lead" style={{ marginBottom: '32px' }}>
            Prototype content. No production policies currently exist.
          </p>
          <div
            style={{ background: 'var(--s1)', padding: '24px', border: '1px solid var(--border)' }}
          >
            <h3 style={{ marginTop: 0 }}>Demo Mode Usage</h3>
            <p style={{ color: 'var(--muted)' }}>
              You are currently using the frontend prototype in Demo Mode. The simulated
              environments, test results, and "AI" responses are entirely deterministic and mocked.
              They do not reflect real code execution or LLM interactions.
            </p>
            <h3>Account and Data</h3>
            <p style={{ color: 'var(--muted)' }}>
              Any credentials provided during demo signup are not transmitted or securely stored.
              Please do not use real passwords.
            </p>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
};
