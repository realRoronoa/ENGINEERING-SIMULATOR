import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearnerState, INITIAL_DEMO_STATE } from '../types/learner.js';
import { DEMO_USER_FIXTURE } from '../features/demo/demoUserData.js';

interface LearnerContextValue {
  state: LearnerState;
  updateState: (updates: Partial<LearnerState>) => void;
  resetDemoData: () => void;
  loadDemoFixture: () => void;
  loginDemo: (name: string, email: string) => void;
  logout: () => void;
}

const LearnerContext = createContext<LearnerContextValue | undefined>(undefined);

const STORAGE_KEY = 'eng_sim_demo_state_v1';

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LearnerState>(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.getItem === 'function'
      ) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...INITIAL_DEMO_STATE, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored demo state, resetting.', e);
    }
    return INITIAL_DEMO_STATE;
  });

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      typeof window.localStorage.setItem === 'function'
    ) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateState = (updates: Partial<LearnerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetDemoData = () => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      typeof window.localStorage.removeItem === 'function'
    ) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setState(INITIAL_DEMO_STATE);
  };

  const loadDemoFixture = () => {
    setState(DEMO_USER_FIXTURE);
  };

  const loginDemo = (name: string, email: string) => {
    updateState({
      isAuthenticated: true,
      profile: {
        id: 'demo-user-1',
        name,
        email,
        skills: [],
      },
    });
  };

  const logout = () => {
    updateState({ isAuthenticated: false, profile: null });
  };

  return (
    <LearnerContext.Provider
      value={{ state, updateState, resetDemoData, loadDemoFixture, loginDemo, logout }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
};
