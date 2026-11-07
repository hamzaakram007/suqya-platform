/**
 * Suqya Design Tokens V2 — Arabic-first premium logistics platform.
 * Source of truth for Flutter ThemeExtension and web CSS variables.
 */

export const colors = {
  light: {
    primary: '#0A6E6E',
    primaryDark: '#085858',
    primaryMuted: '#E6F3F3',
    accent: '#C9A227',
    accentMuted: '#F8F1D8',
    background: '#F4F7F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#0F1F1F',
    textSecondary: '#5A7070',
    textInverse: '#FFFFFF',
    border: '#D8E3E3',
    borderStrong: '#A8C0C0',
    success: '#1B7A4E',
    warning: '#C47A00',
    error: '#C62828',
    info: '#1565C0',
    mapOverlay: 'rgba(10, 110, 110, 0.12)',
    scrim: 'rgba(15, 31, 31, 0.45)',
  },
  dark: {
    primary: '#3DADB0',
    primaryDark: '#2A8A8C',
    primaryMuted: '#143232',
    accent: '#D4B44A',
    accentMuted: '#3A3420',
    background: '#0B1414',
    surface: '#142020',
    surfaceElevated: '#1A2A2A',
    text: '#F2F7F7',
    textSecondary: '#9BB0B0',
    textInverse: '#0B1414',
    border: '#2A3C3C',
    borderStrong: '#3D5555',
    success: '#4CAF7A',
    warning: '#E6A23C',
    error: '#EF5350',
    info: '#64B5F6',
    mapOverlay: 'rgba(61, 173, 176, 0.18)',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
  highContrast: {
    primary: '#006666',
    text: '#000000',
    background: '#FFFFFF',
    border: '#000000',
    error: '#990000',
    success: '#006600',
  },
} as const;

export const typography = {
  fontFamilyArabic: '"IBM Plex Sans Arabic", "Segoe UI", sans-serif',
  fontFamilyLatin: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  scale: {
    display: { size: 40, lineHeight: 48, weight: 700 },
    title1: { size: 28, lineHeight: 36, weight: 700 },
    title2: { size: 22, lineHeight: 30, weight: 600 },
    title3: { size: 18, lineHeight: 26, weight: 600 },
    body: { size: 16, lineHeight: 24, weight: 400 },
    bodyEmphasis: { size: 16, lineHeight: 24, weight: 500 },
    caption: { size: 14, lineHeight: 20, weight: 400 },
    micro: { size: 12, lineHeight: 16, weight: 500 },
  },
} as const;

export const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80] as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const elevation = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 31, 31, 0.06)',
  md: '0 4px 16px rgba(15, 31, 31, 0.08)',
  lg: '0 12px 40px rgba(15, 31, 31, 0.12)',
  fab: '0 8px 24px rgba(10, 110, 110, 0.28)',
} as const;

export const motion = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 280,
    slow: 420,
    deliberate: 600,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasize: 'cubic-bezier(0.2, 0, 0, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export const touch = {
  minTarget: 48,
  comfortableTarget: 56,
  driverPrimary: 64,
} as const;

export const zIndex = {
  mapChrome: 10,
  sheet: 40,
  modal: 50,
  toast: 60,
  nav: 30,
} as const;

export const brand = {
  name: 'سقيا',
  nameEn: 'Suqya',
  taglineAr: 'ماء يصل إليك بثقة',
  taglineEn: 'Water that arrives with trust',
} as const;
