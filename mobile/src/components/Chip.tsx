import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = { label: string; selected?: boolean; onPress?: () => void; emoji?: string; small?: boolean };

export function Chip({ label, selected, onPress, emoji, small }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        small && styles.small,
        selected && styles.selected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.text, small && styles.textSmall, selected && styles.textSel]}>
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  small: { paddingHorizontal: 12, paddingVertical: 7 },
  selected: { backgroundColor: colors.navy, borderColor: colors.navy },
  text: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  textSmall: { fontSize: 13 },
  textSel: { color: colors.white },
});
