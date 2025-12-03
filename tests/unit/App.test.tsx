import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('Workout Tracker')).toBeInTheDocument();
  });

  it('shows Phase 1 setup complete message', () => {
    render(<App />);
    expect(screen.getByText('Phase 1 Setup Complete')).toBeInTheDocument();
  });
});
