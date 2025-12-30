/**
 * Unit Test: TabItem Component (T040)
 * TDD Red Phase - Write tests FIRST, ensure they FAIL
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabItem } from '../../../src/components/shared/TabItem';

describe('TabItem Component', () => {
  it('renders label correctly', () => {
    render(
      <TabItem
        icon={<span>📝</span>}
        label="記録"
        isActive={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('記録')).toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    render(
      <TabItem
        icon={<span data-testid="icon">📝</span>}
        label="記録"
        isActive={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies active styles when isActive is true', () => {
    const { container } = render(
      <TabItem
        icon={<span>📝</span>}
        label="記録"
        isActive={true}
        onClick={vi.fn()}
      />
    );

    // TabItem should have different styling when active
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-current', 'page');
  });

  it('does not apply active styles when isActive is false', () => {
    const { container } = render(
      <TabItem
        icon={<span>📝</span>}
        label="記録"
        isActive={false}
        onClick={vi.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button).not.toHaveAttribute('aria-current', 'page');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <TabItem
        icon={<span>📝</span>}
        label="記録"
        isActive={false}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has minimum touch target size (WCAG 2.1 AA - 44x44dp)', () => {
    const { container } = render(
      <TabItem
        icon={<span>📝</span>}
        label="記録"
        isActive={false}
        onClick={vi.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    if (!button) throw new Error('Button not found');

    const styles = window.getComputedStyle(button);
    const minWidth = parseInt(styles.minWidth);
    const minHeight = parseInt(styles.minHeight);

    // WCAG 2.1 AA requires minimum 44x44dp
    expect(minWidth).toBeGreaterThanOrEqual(44);
    expect(minHeight).toBeGreaterThanOrEqual(44);
  });

  it('has accessible label', () => {
    render(
      <TabItem
        icon={<span>📝</span>}
        label="記録"
        isActive={false}
        onClick={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: '記録' });
    expect(button).toBeInTheDocument();
  });
});
