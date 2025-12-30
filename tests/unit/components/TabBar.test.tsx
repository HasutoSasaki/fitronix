/**
 * Unit Test: TabBar Component (T039)
 * TDD Red Phase - Write tests FIRST, ensure they FAIL
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../../../src/components/shared/TabBar';

describe('TabBar Component', () => {
  it('renders all three tabs', () => {
    render(<TabBar activeTab="record" onTabChange={vi.fn()} />);

    expect(screen.getByText('記録')).toBeInTheDocument();
    expect(screen.getByText('履歴')).toBeInTheDocument();
    expect(screen.getByText('ライブラリ')).toBeInTheDocument();
  });

  it('marks the active tab correctly', () => {
    render(<TabBar activeTab="history" onTabChange={vi.fn()} />);

    const historyButton = screen.getByRole('button', { name: '履歴' });
    expect(historyButton).toHaveAttribute('aria-current', 'page');

    const recordButton = screen.getByRole('button', { name: '記録' });
    expect(recordButton).not.toHaveAttribute('aria-current', 'page');

    const libraryButton = screen.getByRole('button', { name: 'ライブラリ' });
    expect(libraryButton).not.toHaveAttribute('aria-current', 'page');
  });

  it('calls onTabChange with correct tab when clicked', async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();

    render(<TabBar activeTab="record" onTabChange={handleTabChange} />);

    const historyButton = screen.getByRole('button', { name: '履歴' });
    await user.click(historyButton);

    expect(handleTabChange).toHaveBeenCalledWith('history');
  });

  it('calls onTabChange for each tab', async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();

    render(<TabBar activeTab="record" onTabChange={handleTabChange} />);

    await user.click(screen.getByRole('button', { name: '記録' }));
    expect(handleTabChange).toHaveBeenCalledWith('record');

    await user.click(screen.getByRole('button', { name: '履歴' }));
    expect(handleTabChange).toHaveBeenCalledWith('history');

    await user.click(screen.getByRole('button', { name: 'ライブラリ' }));
    expect(handleTabChange).toHaveBeenCalledWith('library');
  });

  it('is positioned at the bottom of the screen', () => {
    const { container } = render(
      <TabBar activeTab="record" onTabChange={vi.fn()} />
    );

    const tabBar = container.querySelector('nav');
    expect(tabBar).toBeInTheDocument();
    if (!tabBar) throw new Error('TabBar not found');

    const styles = window.getComputedStyle(tabBar);
    expect(styles.position).toBe('fixed');
    expect(styles.bottom).toBe('0px');
  });

  it('has proper navigation role', () => {
    render(<TabBar activeTab="record" onTabChange={vi.fn()} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'メインナビゲーション');
  });

  it('all tab buttons meet WCAG 2.1 AA touch target requirements', () => {
    const { container } = render(
      <TabBar activeTab="record" onTabChange={vi.fn()} />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);

    buttons.forEach((button) => {
      const styles = window.getComputedStyle(button);
      const minWidth = parseInt(styles.minWidth);
      const minHeight = parseInt(styles.minHeight);

      expect(minWidth).toBeGreaterThanOrEqual(44);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });
  });
});
