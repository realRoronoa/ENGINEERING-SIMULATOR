import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../layout/Navbar.js';
import { Footer } from '../layout/Footer.js';
import { Container } from '../ui/Container.js';

export interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  const params = useParams();
  const missionId = params.missionId;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '60vh', padding: '64px 0' }}>
        <Container>
          <div className="tl" style={{ marginBottom: '12px' }}>
            FEATURE PLACEHOLDER
          </div>
          <h2>
            {title} {missionId ? `(#${missionId})` : ''}
          </h2>
          <p className="lead" style={{ marginBottom: '32px' }}>
            {description}
          </p>
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--border)',
              background: 'var(--s1)',
              borderRadius: '6px',
              maxWidth: '600px',
              marginBottom: '32px',
            }}
          >
            <div className="tl" style={{ color: 'var(--inv)', marginBottom: '8px' }}>
              ! IMPLEMENTATION STATUS
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
              This route is scaffolded in the frontend router. Real execution, authentication, and
              grading endpoints will connect in subsequent product milestones.
            </p>
          </div>
          <Link to="/" className="btn p">
            RETURN TO LANDING PAGE
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
};
