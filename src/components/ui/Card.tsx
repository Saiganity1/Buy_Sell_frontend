import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface Props { style?: ViewStyle; children?: React.ReactNode }

export function Card({ style, children }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.cardBg, borderRadius: theme.radius.md, padding: theme.spacing(2), borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow.card },
});
