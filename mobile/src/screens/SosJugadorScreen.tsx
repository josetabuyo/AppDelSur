import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormHeader } from '../components/FormHeader';
import { splitName } from '../lib/payload';
import type { ScreenProps } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

type Opcion = {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  bg: string;
  go: () => void;
};

export default function SosJugadorScreen({ navigation }: ScreenProps<'SosJugador'>) {
  const insets = useSafeAreaInsets();
  const { user, registros, logout } = useSession();
  const nombre = splitName(user?.name).nombre.split(' ')[0];

  const opciones: Opcion[] = [
    { key: 'yo', emoji: '🏉', title: 'Sí, juego', desc: 'Rugby, hockey o rugby inclusivo', bg: colors.celesteSoft, go: () => navigation.navigate('Cuestionario', { cargaPara: 'yo' }) },
    { key: 'hijo', emoji: '🧒', title: 'Cargo los datos de mi hijo/a', desc: 'Para los más chicos que no tienen celu', bg: colors.yellowSoft, go: () => navigation.navigate('Cuestionario', { cargaPara: 'hijo' }) },
    { key: 'comunidad', emoji: '💙', title: 'No juego, soy parte de la comunidad', desc: 'Familia, socio/a, ex jugador/a, amigo/a', bg: '#E8EEF6', go: () => navigation.navigate('Enrolamiento') },
  ];

  return (
    <View style={styles.root}>
      <FormHeader title="¿Sos jugador/a?" subtitle={`${nombre ? `Hola ${nombre} 👋 ` : ''}Elegí la que más te represente.`} />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 28 }]}>
        {registros.length > 0 ? (
          <View style={styles.ya}>
            <Text style={styles.yaTitle}>YA CARGASTE ✓</Text>
            <Text style={styles.yaText}>{registros.map((r) => `${r.nombre} ${r.apellido}`).join(' · ')}</Text>
          </View>
        ) : null}
        {opciones.map((o) => (
          <Pressable
            key={o.key}
            testID={`opcion-${o.key}`}
            accessibilityRole="button"
            onPress={o.go}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 }]}
          >
            <View style={[styles.emojiWrap, { backgroundColor: o.bg }]}>
              <Text style={styles.emoji}>{o.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{o.title}</Text>
              <Text style={styles.cardDesc}>{o.desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
        <Pressable onPress={logout} style={styles.logout} accessibilityRole="button">
          <Text style={styles.logoutText}>
            {user?.email ? `Entraste como ${user.email} · ` : ''}
            <Text style={{ textDecorationLine: 'underline' }}>Salir</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { padding: 20, gap: 14 },
  ya: { backgroundColor: '#E6F6EF', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: '#BFE6D3' },
  yaTitle: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1.2, color: colors.success },
  yaText: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.text, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 18,
    minHeight: 104,
    shadowColor: colors.navy,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  emojiWrap: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 32 },
  cardTitle: { ...display(24), color: colors.navy },
  cardDesc: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, marginTop: 3 },
  arrow: { fontSize: 34, color: colors.celeste, marginTop: -4 },
  logout: { alignItems: 'center', marginTop: 10, padding: 8 },
  logoutText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
