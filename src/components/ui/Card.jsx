import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCurrentTheme } from '../../hooks/useCurrentTheme.js';

export function Card({ style, children }) {
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  return <View style={[styles.card, style]}>{children}</View>;
}

const getStyles = (theme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.cardBg, borderRadius: theme.radius.md, padding: theme.spacing(2), borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow.card },
});
