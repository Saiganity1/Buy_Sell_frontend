import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useCurrentTheme } from '../../hooks/useCurrentTheme.js';

export const Chip = ({ label, active, disabled, onPress, style }) => {
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  return (
    <TouchableOpacity style={[styles.chip, active && styles.active, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.text, active ? { color: '#fff' } : undefined, disabled ? { color: theme.colors.textMuted } : undefined]}>{label}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, marginRight: 8, marginBottom: 8, backgroundColor: theme.colors.cardBg },
    active: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    disabled: { opacity: 0.6 },
    text: { color: theme.colors.text },
  });
