/**
 * Centralized theme for consistent styling across the app
 * Professional color palette with enhanced quality and fewer colors
 */

export const colors = {
  // Background colors - Deep, rich tones for professional look
  background: {
    primary: '#0a0e1a',      // Very deep navy - main background
    secondary: '#141b2d',    // Deep slate blue - cards and sections
    tertiary: '#1f2937',     // Charcoal gray - subtle highlights
    overlay: 'rgba(10, 14, 26, 0.95)', // For modals
  },

  // Text colors - High contrast for readability
  text: {
    primary: '#f8fafc',      // Pure white - main text
    secondary: '#e2e8f0',    // Light gray - secondary text
    tertiary: '#94a3b8',     // Medium gray - labels
    muted: '#64748b',        // Muted gray - placeholders
    inverse: '#0a0e1a',      // For text on light backgrounds
  },

  // Primary brand color - Single vibrant blue
  primary: {
    main: '#3b82f6',         // Vibrant blue
    light: '#60a5fa',        // Light blue for accents
    dark: '#2563eb',         // Dark blue for pressed states
    subtle: 'rgba(59, 130, 246, 0.1)', // Subtle background
  },

  // Status colors - Refined and professional
  status: {
    success: '#10b981',      // Emerald green
    warning: '#f59e0b',      // Warm amber
    error: '#ef4444',        // Clear red
    info: '#06b6d4',         // Cyan
  },

  // Accent colors - Reduced to 4 carefully chosen colors
  accent: {
    purple: '#8b5cf6',       // For lessons and special features
    teal: '#14b8a6',         // For fresh, active elements
    amber: '#f59e0b',        // For attention items
    pink: '#ec4899',         // For workers/people
  },

  // Border colors - Subtle and refined
  border: {
    light: '#1f2937',        // Subtle border
    medium: '#374151',       // Medium border
    focus: '#3b82f6',        // Focus state
  },

  // Semantic colors for specific uses
  surface: {
    elevated: '#1a2332',     // Elevated cards
    hover: '#222d3f',        // Hover states
    pressed: '#1a2433',      // Pressed states
  },
};

export const typography = {
  // Reduced font sizes for better readability
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },

  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const layout = {
  headerHeight: 60,
  tabBarHeight: 60,
  inputHeight: 48,
  buttonHeight: 48,
};
