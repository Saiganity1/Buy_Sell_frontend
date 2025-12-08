import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator.jsx';
import { AuthProvider } from './src/api/AuthContext.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl, initApiBaseUrl, setBaseUrl } from './src/api/client.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, color: 'crimson', marginBottom: 8 }}>Something went wrong.</Text>
          <Text selectable style={{ color: '#333' }}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [devOpen, setDevOpen] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState(getBaseUrl());

  React.useEffect(() => {
    (async () => {
      await initApiBaseUrl();
      setApiUrl(getBaseUrl());
    })();
  }, []);

  const saveApi = async () => {
    const url = apiUrl.trim();
    if (!url) return;
    setBaseUrl(url);
    await AsyncStorage.setItem('api_override', url);
    setDevOpen(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
            <Text onLongPress={() => setDevOpen(true)} style={{ fontSize: 16, color: '#333' }}>Buy & Sell</Text>
          </View>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
          <Modal visible={devOpen} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>API Base URL</Text>
                <TextInput value={apiUrl} onChangeText={setApiUrl} placeholder="http://192.168.1.8:8000/api" style={styles.input} autoCapitalize="none" />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => setDevOpen(false)} style={[styles.btn, { backgroundColor: '#ccc', marginRight: 8 }]}><Text>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={saveApi} style={[styles.btn, { backgroundColor: '#1877F2' }]}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </GestureHandlerRootView>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', backgroundColor: '#fff', borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6 },
});
