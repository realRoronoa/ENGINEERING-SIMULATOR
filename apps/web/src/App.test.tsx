// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.js';

describe('App Component', () => {
  it('renders Engineering Verification logo and headline', () => {
    render(<App />);
    expect(screen.getAllByText(/ENGINEERING/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/The AI era made code cheap/i)).toBeDefined();
  });

  it('renders mission ticket details', () => {
    render(<App />);
    expect(screen.getAllByText(/TICKET-4412/i).length).toBeGreaterThan(0);
  });
});
