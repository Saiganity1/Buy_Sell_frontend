import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator.jsx';
import { AuthProvider } from './src/api/AuthContext.jsx';
import { ThemeProvider, useTheme } from './src/api/ThemeContext.jsx';
import { lightTheme, darkTheme } from './src/theme.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl, initApiBaseUrl, setBaseUrl } from './src/api/client.js';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [devOpen, setDevOpen] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState(getBaseUrl());
  const { isDarkMode, toggleTheme } = useTheme();
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

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
          <View style={{ padding: 12, backgroundColor: currentTheme.colors.headerBg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text onLongPress={() => setDevOpen(true)} style={{ fontSize: 16, color: currentTheme.colors.text, fontWeight: '600' }}>MichaelPlace B&S</Text>
            <TouchableOpacity onPress={toggleTheme} style={{ padding: 8 }}>
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={currentTheme.colors.primary} />
            </TouchableOpacity>
          </View>
          <NavigationContainer>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <AppNavigator theme={currentTheme} />
          </NavigationContainer>
          <Modal visible={devOpen} transparent animationType="fade">
            <View style={[styles.modalBackdrop, { backgroundColor: currentTheme.colors.modalBackdrop }]}>
              <View style={[styles.modalCard, { backgroundColor: currentTheme.colors.cardBg }]}>
                <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>API Base URL</Text>
                <TextInput value={apiUrl} onChangeText={setApiUrl} placeholder="http://192.168.1.8:8000/api" style={[styles.input, { backgroundColor: currentTheme.colors.inputBg, borderColor: currentTheme.colors.inputBorder, color: currentTheme.colors.text }]} autoCapitalize="none" placeholderTextColor={currentTheme.colors.textMuted} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => setDevOpen(false)} style={[styles.btn, { backgroundColor: currentTheme.colors.border }]}><Text style={{ color: currentTheme.colors.text }}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={saveApi} style={[styles.btn, { backgroundColor: currentTheme.colors.primary, marginLeft: 8 }]}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
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
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6 },
});
