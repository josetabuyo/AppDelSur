import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Variant = 'primary' | 'navy' | 'light' | 'ghost' | 'outline';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  big?: boolean;
  testID?: string;
};

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.yellow, fg: colors.navyInk },
  navy: { bg: colors.navy, fg: colors.white },
  light: { bg: colors.white, fg: colors.navy },
  ghost: { bg: 'transparent', fg: colors.white },
  outline: { bg: 'transparent', fg: colors.navy, border: colors.navy },
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon, style, big, testID }: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        big && styles.big,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', opacity: inactive ? 0.55 : 1 },
        variant !== 'ghost' && styles.shadow,
        pressed && !inactive && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.label, big && styles.labelBig, { color: p.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  big: { minHeight: 62 },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.2 },
  labelBig: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 1.5, textTransform: 'uppercase' },
});
