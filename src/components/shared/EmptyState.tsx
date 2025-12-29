/**
 * EmptyState Component (T037)
 * Shared empty state placeholder with dark theme styling
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  };

  const iconContainerStyle: CSSProperties = {
    fontSize: '64px',
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  };

  const titleStyle: CSSProperties = {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: action ? theme.spacing.xl : 0,
    maxWidth: '400px',
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>{icon}</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
      {action && (
        <Button
          variant="primary"
          size="medium"
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
