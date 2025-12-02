import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme.js';

export function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }) {
  const isSecondary = variant === 'secondary';
  const bg = variant === 'success' ? theme.colors.success : variant === 'danger' ? theme.colors.danger : theme.colors.primary;
  return (
    <TouchableOpacity
      style={[styles.btn, isSecondary ? styles.secondary : { backgroundColor: bg }, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, isSecondary ? { color: theme.colors.primary } : undefined, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '600' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.primary },
  disabled: { opacity: 0.6 },
});
