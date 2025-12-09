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
} from 'react-native';
import { useAuth } from '../api/AuthContext.jsx';
import styles from './LoginScreen.styles';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);
  const cardScale = useRef(new Animated.Value(0.98)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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