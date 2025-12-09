import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useCurrentTheme } from '../../hooks/useCurrentTheme.js';

export function Input({ value, onChangeText, placeholder, multiline, keyboardType, style }) {
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, multiline ? { height: 100 } : undefined, style]}
      placeholderTextColor={theme.colors.textMuted}
    />
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    input: { borderWidth: 1, borderColor: theme.colors.inputBorder, borderRadius: theme.radius.sm, padding: 12, backgroundColor: theme.colors.inputBg, color: theme.colors.text },
  });
