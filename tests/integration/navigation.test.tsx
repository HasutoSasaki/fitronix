/**
 * Integration Test: Tab Navigation Flow (T041)
 * TDD Red Phase - Write tests FIRST, ensure they FAIL
 *
 * Independent Test: アプリ起動→タブバーで「履歴」タップ→履歴画面表示→
 * 「ライブラリ」タップ→ライブラリ画面表示→「記録」タップ→記録画面表示、
 * の流れがスムーズに動作することを確認
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('Tab Navigation Flow (Integration)', () => {
  it('navigates between tabs smoothly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initial state: 記録 tab should be active
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    const recordButton = within(navigation).getByRole('button', {
      name: '記録',
    });
    const historyButton = within(navigation).getByRole('button', {
      name: '履歴',
    });
    const libraryButton = within(navigation).getByRole('button', {
      name: 'ライブラリ',
    });

    // Initially, Record screen should be visible
    expect(recordButton).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('record-screen')).toBeInTheDocument();

    // Click 履歴 tab
    await user.click(historyButton);
    expect(historyButton).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('history-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('record-screen')).not.toBeInTheDocument();

    // Click ライブラリ tab
    await user.click(libraryButton);
    expect(libraryButton).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('library-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('history-screen')).not.toBeInTheDocument();

    // Click 記録 tab again
    await user.click(recordButton);
    expect(recordButton).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('record-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('library-screen')).not.toBeInTheDocument();
  });

  it('tab navigation completes within 1 second (SC-007)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole('navigation');
    const historyButton = within(navigation).getByRole('button', {
      name: '履歴',
    });

    const startTime = performance.now();
    await user.click(historyButton);

    // Check that history screen is rendered
    expect(screen.getByTestId('history-screen')).toBeInTheDocument();

    const endTime = performance.now();
    const duration = endTime - startTime;

    // SC-007: タブバー経由で画面遷移を1秒以内に完了
    expect(duration).toBeLessThan(1000);
  });

  it('maintains navigation state across multiple switches', async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole('navigation');

    // Switch tabs multiple times
    await user.click(within(navigation).getByRole('button', { name: '履歴' }));
    await user.click(
      within(navigation).getByRole('button', { name: 'ライブラリ' })
    );
    await user.click(within(navigation).getByRole('button', { name: '記録' }));
    await user.click(within(navigation).getByRole('button', { name: '履歴' }));

    // Final state should be 履歴
    const historyButton = within(navigation).getByRole('button', {
      name: '履歴',
    });
    expect(historyButton).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('history-screen')).toBeInTheDocument();
  });

  it('displays dark theme UI (FR-027)', () => {
    const { container } = render(<App />);

    // App should have dark background
    const app = container.firstChild as HTMLElement;
    expect(app).toBeInTheDocument();

    const styles = window.getComputedStyle(app);
    // Dark theme: black background (#000000 or rgb(0, 0, 0))
    expect(
      styles.backgroundColor === 'rgb(0, 0, 0)' ||
        styles.backgroundColor === '#000000' ||
        styles.backgroundColor === 'black'
    ).toBe(true);
  });
});
