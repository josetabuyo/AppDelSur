import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, display, fonts } from '../theme';
import { Crest } from './Crest';

type Props = { title: string; subtitle?: string; onBack?: () => void; children?: React.ReactNode };

/** Cabecera navy con escudo, título display y slot (ej. barra de progreso). */
export function FormHeader({ title, subtitle, onBack, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[colors.navyDeep, colors.navy]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.top}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Volver" style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40, height: 40 }} />
        )}
        <Crest size={34} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.white, fontSize: 30, lineHeight: 32, marginTop: -3, fontFamily: fonts.semibold },
  title: { ...display(38), color: colors.white },
  subtitle: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: 'rgba(255,255,255,0.82)', marginTop: 6 },
});
