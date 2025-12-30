/**
 * App Component Tests
 * Updated for User Story 6 - Navigation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App', () => {
  it('renders the app with navigation', () => {
    render(<App />);

    // Check that navigation is present
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Check that all three tab buttons are present
    expect(screen.getByRole('button', { name: '記録' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '履歴' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ライブラリ' })
    ).toBeInTheDocument();
  });

  it('shows the record screen by default', () => {
    render(<App />);

    // Record screen should be visible by default
    expect(screen.getByTestId('record-screen')).toBeInTheDocument();

    // Record tab should be active
    const recordButton = screen.getByRole('button', { name: '記録' });
    expect(recordButton).toHaveAttribute('aria-current', 'page');
  });
});
