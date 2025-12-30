/**
 * Button Component (T033)
 * Shared UI component with dark theme styling
 * WCAG 2.1 AA: Minimum touch target 44x44dp
 */

import { CSSProperties, useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

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

  const getBackgroundColor = () => {
    if (variant === 'text') return 'transparent';
    if (disabled) {
      return variantStyles[variant].backgroundColor as string;
    }
    if (isHovered) {
      switch (variant) {
        case 'primary':
          return theme.colors.primaryHover;
        case 'secondary':
          return theme.colors.secondaryHover;
        case 'danger':
          return theme.colors.dangerHover;
        default:
          return variantStyles[variant].backgroundColor as string;
      }
    }
    return variantStyles[variant].backgroundColor as string;
  };

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
    backgroundColor: getBackgroundColor(),
  };

  return (
    <button
      style={{
        ...baseStyle,
        color: variantStyles[variant].color,
        ...sizeStyles[size],
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={() => {
        if (!disabled) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (!disabled) setIsHovered(false);
      }}
    >
      {children}
    </button>
  );
}
