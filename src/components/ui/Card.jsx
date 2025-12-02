import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme.js';

export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.cardBg, borderRadius: theme.radius.md, padding: theme.spacing(2), borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow.card },
});
