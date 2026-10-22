import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** Las tres franjas del club (💙🤍💛) como acento gráfico. */
export function Stripes({ width = 72 }: { width?: number }) {
  return (
    <View style={[styles.row, { width }]}>
      <View style={[styles.s, { backgroundColor: colors.celeste }]} />
      <View style={[styles.s, { backgroundColor: colors.white }]} />
      <View style={[styles.s, { backgroundColor: colors.yellow }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden' },
  s: { flex: 1 },
});
