/**
 * LoadingSpinner Component (T036)
 * Shared loading indicator with dark theme styling
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
}

export function LoadingSpinner({
  size = 'medium',
  'aria-label': ariaLabel = '読み込み中',
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '64px',
  };

  const spinnerSize = sizeMap[size];

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const spinnerStyle: CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `4px solid ${theme.colors.border}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  // Inject keyframes for spinner animation
  const styleTag = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{styleTag}</style>
      <div style={containerStyle} role="status" aria-label={ariaLabel}>
        <div style={spinnerStyle} />
      </div>
    </>
  );
}
