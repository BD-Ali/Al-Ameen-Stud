/**
 * Centralized theme for consistent styling across the app
 * Professional color palette with enhanced quality and fewer colors
 */

export const colors = {
  // Background colors - Deep, rich tones for professional look
  background: {
    primary: '#080c18',      // Very deep navy - main background
    secondary: '#111827',    // Deep slate - cards and sections
    tertiary: '#1a2234',     // Charcoal - subtle highlights
    overlay: 'rgba(8, 12, 24, 0.97)', // For modals
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
    yellow: '#fbbf24',       // For add icons and highlights
  },

  // Border colors - Subtle and refined
  border: {
    light: '#1e2d42',        // Subtle border
    medium: '#2d3f57',       // Medium border
    focus: '#3b82f6',        // Focus state
    highlight: 'rgba(255, 255, 255, 0.07)', // Top card highlight
  },

  // Semantic colors for specific uses
  surface: {
    elevated: '#16213a',     // Elevated cards
    hover: '#1e2d42',        // Hover states
    pressed: '#0e1a2e',      // Pressed states
    glass: 'rgba(255, 255, 255, 0.04)', // Frosted glass overlay
  },

  // Icon colors for semantic differentiation across the app
  icon: {
    horse: '#F39C12',        // Horse-related icons
    calendar: '#5DADE2',     // Calendar / schedule icons
    user: '#1ABC9C',         // User / people icons
    lesson: '#9B59B6',       // Lesson / book icons
    money: '#27AE60',        // Payment / success icons
    alert: '#E74C3C',        // Alert / danger icons
    info: '#3498DB',         // Information icons
    promo: '#E91E63',        // Promotional icons
    event: '#9C27B0',        // Event icons
    feed: '#FF9800',         // Feed / carrot icons
    breed: '#E67E22',        // Breed / chart icons
    task: '#3B82F6',         // Task / clipboard icons
    muted: '#64748b',        // Empty state icons
    onWhite: '#ffffff',      // Icons on colored backgrounds
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
    display: 36,
    hero: 48,
    jumbo: 64,
  },

  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xxs: 2,
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
  xxxl: 28,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 16,
  },
  // Blue-tinted shadow for primary action elements
  primary: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  // Success-tinted shadow for positive elements
  success: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const layout = {
  headerHeight: 60,
  tabBarHeight: 60,
  inputHeight: 48,
  buttonHeight: 48,
};
