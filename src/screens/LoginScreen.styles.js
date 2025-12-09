import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f1724' },
  flex: { flex: 1 },
  header: {
    paddingVertical: 28,
    backgroundColor: '#072033',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  brand: { color: '#9be3ff', fontSize: 26, fontWeight: '700' },
  brandSub: { color: '#d0f7ff', fontSize: 12, marginTop: 4 },

  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.cardBg || '#f8fafc',
    borderRadius: theme.radius.lg || 14,
    padding: 20,
    // subtle shadow for iOS and Android
    shadowColor: '#001219',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },

  title: { fontSize: 20, color: '#06283D', fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#40667a', marginBottom: 14 },

  error: { color: theme.colors.danger || '#b92525', marginBottom: 10 },

  input: {
    backgroundColor: '#fff',
    borderColor: '#e6eef3',
    borderWidth: 1,
    borderRadius: theme.radius.md || 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#06283D',
    fontSize: 15,
    marginBottom: 10,
  },

  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, marginBottom: 0 },

  showBtn: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm || 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  showText: { color: '#0b7285', fontWeight: '600' },

  buttonWrap: { marginTop: 14, borderRadius: theme.radius.md || 10, overflow: 'hidden' },
  button: {
    backgroundColor: '#7dd3fc',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.radius.md || 10,
  },
  buttonText: { color: '#06283D', fontWeight: '700', fontSize: 16 },
  buttonPressed: { opacity: 0.96 },
  buttonDisabled: { opacity: 0.7 },

  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#0b7285', fontWeight: '600' },

  footer: { marginTop: 20, alignItems: 'center' },
  small: { color: '#7da6b5', fontSize: 12 },
});
