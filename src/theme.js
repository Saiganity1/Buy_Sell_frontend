export const theme = {
  colors: {
    primary: '#1877F2',
    primarySoft: '#e7f0ff',
    success: '#34a853',
    danger: '#d93025',
    text: '#222',
    textMuted: '#666',
    border: '#e5e7eb',
    cardBg: '#ffffff',
    bg: '#f8fafc',
  },
  spacing: (n) => n * 8,
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
  },
  text: {
    title: { fontSize: 20, fontWeight: '700', color: '#222' },
    subtitle: { fontSize: 16, fontWeight: '600', color: '#222' },
    body: { fontSize: 14, color: '#444' },
    small: { fontSize: 12, color: '#666' },
  },
};
