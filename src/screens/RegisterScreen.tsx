import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../api/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onRegister = async () => {
    try {
      setError(null);
      await register({ username, email, password, first_name: firstName, last_name: lastName });
    } catch (e: any) {
      setError('Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.header}><Text style={styles.headerText}>Create Account</Text></View>
      <View style={styles.container}>
        <View style={styles.card}>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
          <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={styles.input} />
          <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={styles.input} />
          <TouchableOpacity style={styles.button} onPress={onRegister}><Text style={styles.buttonText}>Sign Up</Text></TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1877F2', paddingVertical: 16, alignItems: 'center' },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  container: { flex: 1, backgroundColor: '#f0f2f5', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', width: '100%', maxWidth: 360, borderRadius: 8, padding: 16, elevation: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#1877F2', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#1877F2' },
  error: { color: 'red', marginBottom: 8 }
});
