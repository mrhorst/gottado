export const colors = {
  primary: '#0A84FF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7FA',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textMuted: '#8E8E93',
  success: '#34C759',
  warning: '#FF9500',
  iOSred: '#FF3B30',
  border: '#E5E5EA',
  borderSubtle: '#EEF0F4',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
}

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 17, fontWeight: '700', lineHeight: 22 },

  body1: { fontSize: 16, lineHeight: 24 },
  body2: { fontSize: 14, lineHeight: 20 },

  caption: { fontSize: 12, lineHeight: 16, color: '#6B7280' },

  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
} as const

export const shadow = {
  card: '0px 2px 8px rgba(0, 0, 0, 0.06)',
  pop: '0px 6px 16px rgba(0, 0, 0, 0.12)',
}

export const layout = {
  screenPadding: spacing.md,
  screenGap: spacing.md,
  formGap: spacing.lg,
  fieldGap: spacing.sm,
}
