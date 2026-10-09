// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.js';

describe('App Component', () => {
  it('renders Engineering Simulator header', () => {
    render(<App />);
    expect(screen.getByText('Engineering Simulator')).toBeDefined();
  });
});
