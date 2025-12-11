export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  text: '#000000',
  error: '#FF3B30',
  border: '#C6C6C8',
}

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },

  body1: { fontSize: 16, lineHeight: 24 },
  body2: { fontSize: 14, lineHeight: 20 },

  caption: { fontSize: 12, lineHeight: 16, color: '#666' },

  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
} as const
