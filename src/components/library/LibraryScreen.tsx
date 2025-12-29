/**
 * LibraryScreen (T047)
 * Enhanced UI for exercise library screen
 * Full implementation in Phase 8 (User Story 5)
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export function LibraryScreen() {
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const headingStyle: CSSProperties = {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  };

  const addButtonStyle: CSSProperties = {
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    border: 'none',
    cursor: 'pointer',
    padding: theme.spacing.sm,
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    transition: theme.transitions.fast,
    fontFamily: 'system-ui, -apple-system, sans-serif',
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

  const BookOpenIcon = (
    <svg
      style={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  const PlusIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div style={containerStyle} data-testid="library-screen">
      <header style={headerStyle}>
        <h1 style={headingStyle}>エクササイズライブラリ</h1>
        <button
          style={addButtonStyle}
          aria-label="新規種目追加"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {PlusIcon}
        </button>
      </header>

      <div style={contentStyle}>
        <div style={emptyStateStyle}>
          {BookOpenIcon}
          <p style={emptyTextStyle}>ライブラリが空です</p>
          <p style={emptySubtextStyle}>
            エクササイズを追加して、トレーニングメニューを管理しましょう
          </p>
        </div>
      </div>
    </div>
  );
}
