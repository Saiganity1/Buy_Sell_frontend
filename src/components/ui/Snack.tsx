import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Snack({ visible, message, type = 'success', onHide, duration = 2000 }: {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      onHide && onHide();
    }, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onHide]);

  if (!visible) return null;
  const bg = type === 'success' ? '#1e7e34' : type === 'error' ? '#d93025' : '#333';

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.snack, { backgroundColor: bg }]}> 
        <Text style={styles.text} numberOfLines={2}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center' },
  snack: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, maxWidth: '90%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 },
  text: { color: '#fff', fontWeight: '600' },
});
