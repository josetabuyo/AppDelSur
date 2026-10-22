import React, { forwardRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

export type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

type Props = { header: React.ReactNode; footer: React.ReactNode; children: React.ReactNode; banner?: string | null };

/** Cabecera + formulario scrolleable + barra de acciones fija abajo (sube con el teclado). */
export const FormScaffold = forwardRef<ScrollViewRef, Props>(function FormScaffold({ header, footer, children, banner }, ref) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header}
      <ScrollView ref={ref} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {banner ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        ) : null}
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
    </KeyboardAvoidingView>
  );
});

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { padding: 22, paddingBottom: 40, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 520 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E4EAF1',
    flexDirection: 'row',
    gap: 10,
  },
  banner: { width: '100%', maxWidth: 520, backgroundColor: '#FDECEE', borderRadius: radius.md, padding: 14, marginBottom: 16 },
  bannerText: { fontFamily: fonts.semibold, color: colors.error, fontSize: 14 },
  section: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 10 },
});
