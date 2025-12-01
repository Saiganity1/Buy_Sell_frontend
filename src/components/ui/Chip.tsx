import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface Props {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<Props> = ({ label, active, disabled, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.active, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.text, active ? { color: '#fff' } : undefined, disabled ? { color: '#999' } : undefined]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, marginRight: 8, marginBottom: 8, backgroundColor: '#fff' },
  active: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  disabled: { opacity: 0.6 },
  text: { color: theme.colors.text },
});
