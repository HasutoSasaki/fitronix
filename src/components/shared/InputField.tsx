/**
 * InputField Component (T034)
 * Shared input component with dark theme styling
 */

import { CSSProperties, useState } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);

  const baseStyle: CSSProperties = {
    width: '100%',
    padding: `${theme.spacing.md} ${theme.spacing.md}`,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    backgroundColor:
      isFocused && !disabled
        ? theme.colors.inputBackgroundFocus
        : theme.colors.inputBackground,
    border: `1px solid ${isFocused && !disabled ? theme.colors.borderFocus : theme.colors.border}`,
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

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsFocused(false);
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
