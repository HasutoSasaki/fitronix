/**
 * ErrorMessage Component (T038)
 * Shared error message component with dark theme styling
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';
import { Button } from './Button';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({
  message,
  onRetry,
  onDismiss,
}: ErrorMessageProps) {
  const containerStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.danger}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  };

  const iconStyle: CSSProperties = {
    fontSize: theme.fontSize.xl,
    color: theme.colors.danger,
    marginRight: theme.spacing.md,
  };

  const messageContainerStyle: CSSProperties = {
    flex: 1,
  };

  const messageStyle: CSSProperties = {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    margin: 0,
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  };

  return (
    <div style={containerStyle} role="alert">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={iconStyle}>⚠️</span>
          <div style={messageContainerStyle}>
            <p style={messageStyle}>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.lg,
              cursor: 'pointer',
              padding: theme.spacing.sm,
              minWidth: theme.touchTarget.minWidth,
              minHeight: theme.touchTarget.minHeight,
            }}
            aria-label="閉じる"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            ✕
          </button>
        )}
      </div>
      {onRetry && (
        <div style={actionsStyle}>
          <Button
            variant="secondary"
            size="small"
            onClick={onRetry}
            aria-label="再試行"
          >
            再試行
          </Button>
        </div>
      )}
    </div>
  );
}
