import React from 'react';
import { TextInput, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'email-address';
  style?: ViewStyle;
}

export function Input({ value, onChangeText, placeholder, multiline, keyboardType, style }: Props) {
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
