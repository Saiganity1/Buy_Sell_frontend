import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../api/AuthContext.jsx';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const onLogin = async () => {
    try {
      setError(null);
      await login(username.trim(), password);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.header}>
  <Text style={styles.headerText}>MichaelPlace B&S</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Log in</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
          <TouchableOpacity style={styles.button} onPress={onLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Create new account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1877F2', paddingVertical: 40, alignItems: 'center' },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  container: { flex: 1, backgroundColor: '#f0f2f5', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', width: '100%', maxWidth: 360, borderRadius: 8, padding: 16, elevation: 4 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#1877F2', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#1877F2' },
  error: { color: 'red', marginBottom: 8 }
});
