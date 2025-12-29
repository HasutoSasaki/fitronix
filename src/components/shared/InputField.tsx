/**
 * InputField Component (T034)
 * Shared input component with dark theme styling
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export interface InputFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
  'aria-label': string;
}

export function InputField({
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  placeholder,
  disabled = false,
  'aria-label': ariaLabel,
}: InputFieldProps) {
  const baseStyle: CSSProperties = {
    width: '100%',
    padding: `${theme.spacing.md} ${theme.spacing.md}`,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.inputBackground,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: theme.transitions.fast,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    // WCAG 2.1 AA: Minimum touch target height
    minHeight: theme.touchTarget.minHeight,
  };

  const disabledStyle: CSSProperties = disabled
    ? {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: theme.colors.surface,
      }
    : {};

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.backgroundColor = theme.colors.inputBackgroundFocus;
    e.currentTarget.style.borderColor = theme.colors.borderFocus;
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.backgroundColor = theme.colors.inputBackground;
    e.currentTarget.style.borderColor = theme.colors.border;
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...baseStyle,
        ...disabledStyle,
      }}
    />
  );
}
