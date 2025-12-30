/**
 * HistoryScreen (T046)
 * Enhanced UI for workout history screen
 * Full implementation in Phase 7 (User Story 4)
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export function HistoryScreen() {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', // Account for fixed TabBar + Safe Area
    color: theme.colors.textPrimary,
  } as CSSProperties;

  const headerStyle: CSSProperties = {
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border}`,
  };

  const headingStyle: CSSProperties = {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing.lg,
  };

  const emptyStateStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: theme.spacing.xl,
  };

  const iconStyle: CSSProperties = {
    width: '80px',
    height: '80px',
    marginBottom: theme.spacing.lg,
    opacity: 0.3,
  };

  const emptyTextStyle: CSSProperties = {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  };

  const emptySubtextStyle: CSSProperties = {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDisabled,
  };

  const CalendarIcon = (
    <svg
      style={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );

  return (
    <div style={containerStyle} data-testid="history-screen">
      <header style={headerStyle}>
        <h1 style={headingStyle}>ワークアウト履歴</h1>
      </header>

      <div style={contentStyle}>
        <div style={emptyStateStyle}>
          {CalendarIcon}
          <p style={emptyTextStyle}>履歴がありません</p>
          <p style={emptySubtextStyle}>
            ワークアウトを記録すると、ここに履歴が表示されます
          </p>
        </div>
      </div>
    </div>
  );
}
