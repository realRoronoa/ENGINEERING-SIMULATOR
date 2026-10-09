import React from 'react';
import { Container } from '../components/ui/Container.js';
import { Navbar } from '../components/layout/Navbar.js';
import { Footer } from '../components/layout/Footer.js';

export const Privacy: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container>
        <div style={{ maxWidth: 800, margin: '64px auto', paddingBottom: '64px' }}>
          <h1>Privacy Policy</h1>
          <p className="lead" style={{ marginBottom: '32px' }}>
            Prototype content. No production policies currently exist.
          </p>
          <div style={{ background: 'var(--s1)', padding: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0 }}>Data Collection in Demo Mode</h3>
            <p style={{ color: 'var(--muted)' }}>
              In demo mode, all data is stored locally in your browser using `localStorage`. We do not transmit your
              demo session data, mock profile, or test answers to any remote server.
            </p>
            <h3>Production (Future)</h3>
            <p style={{ color: 'var(--muted)' }}>
              When connected to the production backend, Engineering Simulator will collect performance metrics, code
              submissions, verification evidence, and chat logs with the AI Investigator to accurately evaluate your
              engineering judgment.
            </p>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
};
