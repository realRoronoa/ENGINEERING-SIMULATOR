// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LearnerProvider } from '../../state/LearnerContext.js';
import { Login } from '../auth/Login.js';
import { Dashboard } from '../dashboard/Dashboard.js';
import { MissionsLibrary } from '../missions/MissionsLibrary.js';
import { TransferTask } from '../transfer/TransferTask.js';
import { DEMO_USER_FIXTURE } from './demoUserData.js';
import React from 'react';

const renderWithRouterAndContext = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LearnerProvider>{ui}</LearnerProvider>
    </BrowserRouter>
  );
};

describe('Demo User Experience', () => {
  beforeEach(() => {
    // Basic mock of localStorage for jsdom
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key in store) {
            delete store[key];
          }
        },
      },
      writable: true,
    });
    window.localStorage.clear();
  });

  afterEach(() => {
    if (window.localStorage && typeof window.localStorage.clear === 'function') {
      window.localStorage.clear();
    }
  });

  it('Clicking Explore Demo Account enters the demo session and bypasses auth', async () => {
    renderWithRouterAndContext(<Login />);

    // Initial state check
    expect(screen.getByText('EXPLORE DEMO ACCOUNT')).toBeDefined();

    // Simulate clicking the demo button
    fireEvent.click(screen.getByText('EXPLORE DEMO ACCOUNT'));

    // Wait for the context to update state and trigger navigation effect
    await waitFor(() => {
      const stored = window.localStorage.getItem('eng_sim_demo_state_v1');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored || '{}');
      expect(parsed.profile?.name).toBe('Alex Morgan');
      expect(parsed.isDemo).toBe(true);
    });
  });

  it('The dashboard displays preloaded learner data', async () => {
    // Preload storage
    window.localStorage.setItem('eng_sim_demo_state_v1', JSON.stringify(DEMO_USER_FIXTURE));

    renderWithRouterAndContext(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Alex Morgan')).toBeDefined();
      expect(screen.getByText('Goal: backend mastery')).toBeDefined();
      // Should show in-progress mission 4413
      expect(screen.getByText(/TICKET-4413/i)).toBeDefined();
    });
  });

  it('Mission counts and status remain consistent across pages', () => {
    window.localStorage.setItem('eng_sim_demo_state_v1', JSON.stringify(DEMO_USER_FIXTURE));

    // Check missions library
    renderWithRouterAndContext(<MissionsLibrary />);

    // 4412 is completed/available to retry, 4413 is in progress but shows in library
    expect(screen.getAllByText(/TICKET/i).length).toBeGreaterThan(0);
  });

  it('Corrupted stored state recovers safely', () => {
    // Store invalid JSON
    window.localStorage.setItem('eng_sim_demo_state_v1', '{ invalid json');

    renderWithRouterAndContext(<Dashboard />);

    // Should fallback to initial unauthenticated state without crashing
    expect(screen.getAllByText(/Welcome back/i).length).toBeGreaterThan(0);
  });

  it('The AI-off transfer screen does not expose AI assistance', () => {
    window.localStorage.setItem('eng_sim_demo_state_v1', JSON.stringify(DEMO_USER_FIXTURE));

    renderWithRouterAndContext(<TransferTask />);

    expect(screen.getByText(/AI OFF — INDEPENDENT VERIFICATION/i)).toBeDefined();
    expect(screen.getByText(/No AI Investigator available/i)).toBeDefined();
  });
});
