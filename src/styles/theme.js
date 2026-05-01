/**
 * Al-Ameen Stud - Centralized design system
 * Dark navy + black theme. White text. Single blue brand color.
 * Status colors for alerts only. No category color-coding.
 */

export const colors = {
  // Backgrounds: black -> dark navy
  background: {
    primary:   '#0A0F1E',
    secondary: '#0F172A',
    tertiary:  '#1E293B',
    overlay:   'rgba(5, 8, 20, 0.92)',
  },

  // Text: white scale
  text: {
    primary:   '#F8FAFC',
    secondary: '#94A3B8',
    tertiary:  '#475569',
    muted:     '#1E293B',
    inverse:   '#0F172A',
  },

  // Primary brand: vivid blue
  primary: {
    main:   '#2563EB',
    light:  '#60A5FA',
    dark:   '#1E3A8A',
    subtle: 'rgba(37, 99, 235, 0.15)',
  },

  // Status: system alerts only. Never decorative.
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error:   '#EF4444',
    info:    '#60A5FA',
  },

  // Accent: all resolve to primary blue. No category color-coding.
  accent: {
    purple: '#2563EB',
    teal:   '#2563EB',
    amber:  '#2563EB',
    pink:   '#2563EB',
    yellow: '#2563EB',
  },

  // Borders
  border: {
    light:     '#1E293B',
    medium:    '#334155',
    focus:     '#2563EB',
    highlight: 'rgba(37, 99, 235, 0.20)',
  },

  // Surfaces
  surface: {
    elevated: '#0F172A',
    hover:    '#1E293B',
    pressed:  '#0A0F1E',
    glass:    'rgba(15, 23, 42, 0.80)',
  },

  // Icons: white on dark bg
  icon: {
    primary:   '#F8FAFC',
    secondary: '#94A3B8',
    muted:     '#475569',
    accent:    '#60A5FA',
    onDark:    '#F8FAFC',
  },
};

export const typography = {
  size: {
    xs:      10,
    sm:      12,
    base:    14,
    md:      16,
    lg:      18,
    xl:      20,
    xxl:     24,
    xxxl:    28,
    display: 36,
    hero:    48,
    jumbo:   64,
  },
  weight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },
};

export const spacing = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 40,
};

export const borderRadius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 14,
  },
  primary: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  success: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  glow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const layout = {
  headerHeight: 60,
  tabBarHeight: 64,
  inputHeight:  48,
  buttonHeight: 48,
};