import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function StepProgress({ step, total, labels }: { step: number; total: number; labels?: string[] }) {
  return (
    <View accessibilityLabel={`Paso ${step + 1} de ${total}`}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i <= step && styles.barOn]} />
        ))}
      </View>
      <Text style={styles.text}>
        PASO {step + 1} DE {total}
        {labels?.[step] ? `  ·  ${labels[step].toUpperCase()}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)' },
  barOn: { backgroundColor: colors.yellow },
  text: { marginTop: 10, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2, color: 'rgba(255,255,255,0.85)' },
});
