import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CuentaFooter } from '../components/CuentaFooter';
import { FormHeader } from '../components/FormHeader';
import { splitName } from '../lib/payload';
import type { ScreenProps } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

const DEPORTE_EMOJI = { rugby: '🏉', hockey: '🏑', rugby_inclusivo: '🤝' } as const;

/**
 * Para quien ya está en el padrón del club (su mail de Google figura ahí): sin presentación ni
 * preguntas previas, directo a completar sus datos y los de su familia, ya precargados.
 */
export default function PadronScreen({ navigation }: ScreenProps<'Padron'>) {
  const insets = useSafeAreaInsets();
  const { user, padron } = useSession();
  const nombre = splitName(user?.name).nombre.split(' ')[0];
  const faltan = padron.filter((p) => !p.cargado).length;

  return (
    <View style={styles.root}>
      <FormHeader
        title={faltan ? 'Completá tus datos' : '¡Listo!'}
        subtitle={`${nombre ? `Hola ${nombre} 👋 ` : ''}${
          faltan ? 'Ya te tenemos en el club; sumá lo que falta, es un minuto.' : 'Tus datos ya están en el club. ¡Gracias!'
        }`}
      />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 28 }]}>
        {padron.map((p) => (
          <Pressable
            key={p.socio}
            testID={`socio-${p.socio}`}
            accessibilityRole="button"
            onPress={() => navigation.navigate('Ficha', { persona: p })}
            style={({ pressed }) => [styles.card, p.cargado && styles.cardDone, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.emoji}>{p.deporte ? DEPORTE_EMOJI[p.deporte] : '💙'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {p.nombre} {p.apellido}
              </Text>
              {p.division || p.deporte === 'rugby_inclusivo' ? <Text style={styles.cardDesc}>{p.division ?? 'Rugby inclusivo'}</Text> : null}
            </View>
            {p.cargado ? <Text style={styles.done}>✓ Listo</Text> : <Text style={styles.go}>Completar ›</Text>}
          </Pressable>
        ))}

        <Text style={styles.tip}>
          ¿Tenés al lado a un compañero/a que no tiene la app o no tiene mail? <Text style={styles.tipStrong}>Cargalo vos</Text>.
        </Text>
        <View style={styles.row}>
          <Pressable testID="sumar-companero" style={styles.small} onPress={() => navigation.navigate('Ficha', { cargaPara: 'companero' })} accessibilityRole="button">
            <Text style={styles.smallText}>🤜 Un compañero/a</Text>
          </Pressable>
          <Pressable testID="sumar-hijo" style={styles.small} onPress={() => navigation.navigate('Ficha', { cargaPara: 'hijo' })} accessibilityRole="button">
            <Text style={styles.smallText}>🧒 Otro hijo/a</Text>
          </Pressable>
        </View>
        <CuentaFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { padding: 20, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  cardDone: { backgroundColor: '#F1FAF5', borderColor: '#CDEBDB' },
  emoji: { fontSize: 28 },
  cardTitle: { ...display(22), color: colors.navy },
  cardDesc: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.textMuted, marginTop: 2 },
  done: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.success },
  go: { fontFamily: fonts.bold, fontSize: 14, color: colors.celeste },
  tip: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted, marginTop: 10 },
  tipStrong: { fontFamily: fonts.bold, color: colors.navy },
  row: { flexDirection: 'row', gap: 10 },
  small: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  smallText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.navy, textAlign: 'center' },
});
