import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme.js';

export function Input({ value, onChangeText, placeholder, multiline, keyboardType, style }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, multiline ? { height: 100 } : undefined, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, padding: 12, backgroundColor: '#fff' },
});
