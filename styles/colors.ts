// Thème clair
export const lightColors = {
  // Primary colors
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10b981',
  
  // Secondary colors
  secondary: '#7c3aed',
  secondaryDark: '#6d28d9',
  
  // Status colors
  success: '#059669',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // App specific
  background: '#f0fdf4',
  cardBackground: '#ffffff',
  border: '#d1fae5',
  
  // Activity colors
  running: '#059669',
  biking: '#7c3aed',
} as const;

// Thème sombre
export const darkColors = {
  // Primary colors
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#34d399',
  
  // Secondary colors
  secondary: '#8b5cf6',
  secondaryDark: '#7c3aed',
  
  // Status colors
  success: '#10b981',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Neutral colors
  white: '#1f2937',
  black: '#f9fafb',
  gray50: '#111827',
  gray100: '#1f2937',
  gray200: '#374151',
  gray300: '#4b5563',
  gray400: '#6b7280',
  gray500: '#9ca3af',
  gray600: '#d1d5db',
  gray700: '#e5e7eb',
  gray800: '#f3f4f6',
  gray900: '#f9fafb',
  
  // App specific
  background: '#111827',
  cardBackground: '#1f2937',
  border: '#374151',
  
  // Activity colors
  running: '#10b981',
  biking: '#8b5cf6',
} as const;

// Thème haut contraste
export const highContrastColors = {
  ...lightColors,
  primary: '#000000',
  secondary: '#000000',
  success: '#000000',
  warning: '#000000',
  error: '#ff0000',
  info: '#000000',
  gray500: '#000000',
  gray600: '#000000',
  gray700: '#000000',
  gray800: '#000000',
  border: '#000000',
} as const;

const colors = {
  // Primary colors
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10b981',
  
  // Secondary colors
  secondary: '#7c3aed',
  secondaryDark: '#6d28d9',
  
  // Status colors
  success: '#059669',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // App specific
  background: '#f0fdf4',
  cardBackground: '#ffffff',
  border: '#d1fae5',
  
  // Activity colors
  running: '#059669',
  biking: '#7c3aed',
} as const;

export default colors;