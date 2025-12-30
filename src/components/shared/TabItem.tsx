/**
 * TabItem Component (T042)
 * TDD Green Phase - 仮実装 (Fake It)
 * Individual tab button for navigation
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function TabItem({ icon, label, isActive, onClick }: TabItemProps) {
  const baseStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    flex: 1,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: theme.spacing.sm,
    // WCAG 2.1 AA: Minimum touch target size
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    transition: theme.transitions.fast,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const activeStyle: CSSProperties = isActive
    ? {
        color: theme.colors.primary,
      }
    : {
        color: theme.colors.textSecondary,
      };

  const iconStyle: CSSProperties = {
    fontSize: theme.fontSize.xl,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle: CSSProperties = {
    fontSize: theme.fontSize.xs,
    fontWeight: isActive ? '700' : '500',
  };

  return (
    <button
      style={{ ...baseStyle, ...activeStyle }}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = theme.colors.textPrimary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = theme.colors.textSecondary;
        }
      }}
    >
      <div style={iconStyle}>{icon}</div>
      <span style={labelStyle}>{label}</span>
    </button>
  );
}
