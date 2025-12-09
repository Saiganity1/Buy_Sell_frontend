export const lightTheme = {
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
    headerBg: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#ddd',
    modalBackdrop: 'rgba(0,0,0,0.3)',
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

export const darkTheme = {
  colors: {
    primary: '#5B9EFF',
    primarySoft: '#1a2a4a',
    success: '#34a853',
    danger: '#ff6b6b',
    text: '#e0e0e0',
    textMuted: '#999',
    border: '#333333',
    cardBg: '#1e1e1e',
    bg: '#0d0d0d',
    headerBg: '#1a1a1a',
    inputBg: '#262626',
    inputBorder: '#444',
    modalBackdrop: 'rgba(0,0,0,0.6)',
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
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
  },
  text: {
    title: { fontSize: 20, fontWeight: '700', color: '#e0e0e0' },
    subtitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0' },
    body: { fontSize: 14, color: '#c0c0c0' },
    small: { fontSize: 12, color: '#999' },
  },
};

export const theme = lightTheme;
