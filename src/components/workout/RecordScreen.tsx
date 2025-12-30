/**
 * RecordScreen (T045)
 * Enhanced UI for workout recording screen
 * Full implementation in Phase 4 (User Story 1)
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export function RecordScreen() {
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
    marginBottom: theme.spacing.xs,
  };

  const dateStyle: CSSProperties = {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
    marginBottom: theme.spacing.md,
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: theme.colors.primary,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    transition: theme.transitions.fast,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const DumbbellIcon = (
    <svg
      style={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.4 14.4L9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l-1.768 1.768a2 2 0 1 1-2.828-2.828l1.767-1.768a2 2 0 1 1-2.828-2.829l1.767-1.768a2 2 0 1 1 2.828-2.828l1.768 1.767a2 2 0 1 1 2.829 2.828l1.768-1.767a2 2 0 1 1 2.828 2.828l-1.767 1.768a2 2 0 1 1 2.828 2.829l-1.768 1.767z" />
    </svg>
  );

  return (
    <div style={containerStyle} data-testid="record-screen">
      <header style={headerStyle}>
        <h1 style={headingStyle}>ワークアウト記録</h1>
        <p style={dateStyle}>{getCurrentDate()}</p>
      </header>

      <div style={contentStyle}>
        <div style={emptyStateStyle}>
          {DumbbellIcon}
          <p style={emptyTextStyle}>新しいワークアウトを開始</p>
          <button
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
            }}
          >
            ワークアウトを開始
          </button>
        </div>
      </div>
    </div>
  );
}
