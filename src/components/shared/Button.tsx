/**
 * Button Component (T033)
 * Shared UI component with dark theme styling
 * WCAG 2.1 AA: Minimum touch target 44x44dp
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'text';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function Button({
  variant,
  size,
  disabled = false,
  onClick,
  children,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    transition: theme.transitions.fast,
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    // WCAG 2.1 AA: Minimum touch target
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const variantStyles: Record<ButtonProps['variant'], CSSProperties> = {
    primary: {
      backgroundColor: disabled ? theme.colors.primary : theme.colors.primary,
      color: theme.colors.textPrimary,
    },
    secondary: {
      backgroundColor: disabled
        ? theme.colors.secondary
        : theme.colors.secondary,
      color: theme.colors.textPrimary,
    },
    danger: {
      backgroundColor: disabled ? theme.colors.danger : theme.colors.danger,
      color: theme.colors.textPrimary,
    },
    text: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
    },
  };

  const sizeStyles: Record<ButtonProps['size'], CSSProperties> = {
    small: {
      fontSize: theme.fontSize.sm,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    },
    medium: {
      fontSize: theme.fontSize.md,
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    },
    large: {
      fontSize: theme.fontSize.lg,
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    },
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor =
            variant === 'primary'
              ? theme.colors.primaryHover
              : variant === 'secondary'
                ? theme.colors.secondaryHover
                : variant === 'danger'
                  ? theme.colors.dangerHover
                  : 'transparent';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor =
            variant === 'text'
              ? 'transparent'
              : (variantStyles[variant].backgroundColor ?? '');
        }
      }}
    >
      {children}
    </button>
  );
}
