import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.js';
import { Container } from '../ui/Container.js';
import { useLearner } from '../../state/LearnerContext.js';

export const Navbar: React.FC = () => {
  const { state, logout, resetDemoData } = useLearner();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <Container>
        <a className="logo" href="/">
          ◉ ENGINEERING<i>/</i>VERIFICATION
        </a>
        <div className="links">
          {!state.isAuthenticated ? (
            <>
              <a href="/#mission">Mission</a>
              <a href="/#evidence">Evidence</a>
              <a href="/#how">Method</a>
              <a href="/login">Log In</a>
            </>
          ) : (
            <>
              {state.isDemo && (
                <span
                  style={{
                    color: 'var(--inv)',
                    border: '1px solid var(--inv)',
                    padding: '2px 6px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    marginRight: '8px',
                  }}
                >
                  DEMO MODE
                </span>
              )}
              <a href="/dashboard">Dashboard</a>
              <a href="/missions">Missions</a>
              <a href="/profile">Profile</a>
              {state.isDemo && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    resetDemoData();
                    navigate('/login');
                  }}
                >
                  Reset Demo
                </a>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Log Out
              </a>
            </>
          )}
        </div>
        {!state.isAuthenticated && (
          <Button variant="primary" size="sm" href="/signup">
            START DEMO
          </Button>
        )}
      </Container>
    </nav>
  );
};
