/**
 * Dark Theme Styles for Workout Tracker
 * FR-027: ダークテーマ (黒背景、白文字) のUIを提供する
 * WCAG 2.1 AA: Color contrast ratios verified
 */

export const theme = {
  colors: {
    // Base colors
    background: '#000000', // Pure black
    surface: '#1a1a1a', // Dark gray for cards/surfaces
    surfaceHover: '#2a2a2a', // Hover state for surfaces

    // Text colors
    textPrimary: '#ffffff', // White text (high contrast)
    textSecondary: '#b0b0b0', // Gray text (medium contrast)
    textDisabled: '#666666', // Disabled text

    // Accent colors
    primary: '#4a9eff', // Blue (for primary actions)
    primaryHover: '#3a8eef', // Darker blue on hover
    secondary: '#6c757d', // Gray (for secondary actions)
    secondaryHover: '#5a6268', // Darker gray on hover
    danger: '#dc3545', // Red (for delete/cancel)
    dangerHover: '#c82333', // Darker red on hover
    success: '#28a745', // Green (for success states)
    warning: '#ffc107', // Yellow (for warnings)

    // Borders
    border: '#333333', // Subtle border
    borderFocus: '#4a9eff', // Blue border on focus

    // Input backgrounds
    inputBackground: '#1a1a1a',
    inputBackgroundFocus: '#2a2a2a',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  // WCAG 2.1 AA: Minimum touch target size 44x44dp
  touchTarget: {
    minWidth: '44px',
    minHeight: '44px',
  },

  // Enhanced touch targets for keypad (60x60dp)
  keypadButton: {
    width: '60px',
    height: '60px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
} as const;

export type Theme = typeof theme;
