import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../api/AuthContext.jsx';
import { useCurrentTheme } from '../hooks/useCurrentTheme.js';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const theme = useCurrentTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);
  const cardScale = useRef(new Animated.Value(0.98)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const styles = getStyles(theme);

  useEffect(() => {
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
  }, [cardScale]);

  const onLogin = async () => {
    if (!username.trim() || !password) {
      setError('Please enter username and password');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await login(username.trim(), password);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onPressIn = () => Animated.spring(buttonScale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>MichaelPlace</Text>
          <Text style={styles.brandSub}>Buy & Sell</Text>
        </View>

        <View style={styles.container}>
          <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}

            <TextInput
              placeholder="Username"
              placeholderTextColor="#9aa3b2"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              accessible
              accessibilityLabel="Username"
            />

            <View style={styles.passwordRow}>
              <TextInput
                ref={passwordRef}
                placeholder="Password"
                placeholderTextColor="#9aa3b2"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={onLogin}
                accessible
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={styles.showBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={onLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              style={({ pressed }) => [
                styles.buttonWrap,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
                {loading ? (
                  <ActivityIndicator color="#06283D" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </Animated.View>
            </Pressable>

            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="link"
            >
              <Text style={styles.linkText}>Create new account</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.small}>By continuing you agree to our Terms & Privacy Policy</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  flex: { flex: 1 },
  header: {
    paddingVertical: 28,
    backgroundColor: theme.colors.headerBg,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  brand: { color: theme.colors.primary, fontSize: 26, fontWeight: '700' },
  brandSub: { color: theme.colors.primarySoft, fontSize: 12, marginTop: 4 },

  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },

  title: { fontSize: 20, color: theme.colors.text, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 14 },

  error: { color: theme.colors.danger, marginBottom: 10 },

  input: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 10,
  },

  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, marginBottom: 0 },

  showBtn: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  showText: { color: theme.colors.primary, fontWeight: '600' },

  buttonWrap: { marginTop: 14, borderRadius: theme.radius.md, overflow: 'hidden' },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonPressed: { opacity: 0.96 },
  buttonDisabled: { opacity: 0.7 },

  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: theme.colors.primary, fontWeight: '600' },

  footer: { marginTop: 20, alignItems: 'center' },
  small: { color: theme.colors.textMuted, fontSize: 12 },
});