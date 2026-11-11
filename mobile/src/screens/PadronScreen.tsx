import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { CuentaFooter } from '../components/CuentaFooter';
import { Crest } from '../components/Crest';
import type { ScreenProps } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

/**
 * Un mail del padrón con varias personas (una familia): elegir de quién se cargan los datos.
 * Mínima: el escudo, la pregunta y los nombres. Cada uno abre su ficha.
 */
export default function PadronScreen({ navigation }: ScreenProps<'Padron'>) {
  const insets = useSafeAreaInsets();
  const { padron, registros } = useSession();
  // Los que agregó a mano (no están en el padrón con su mail), para poder reabrirlos.
  const agregados = registros.filter((r) => r.tipo === 'jugador' && !r.socio);
  const faltan = padron.filter((p) => !p.cargado).length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.body, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]}>
      <View style={styles.inner}>
        <View style={styles.top}>
          <Crest size={36} />
        </View>
        <Text style={styles.title}>{faltan ? '¿De quién son los datos?' : '¡Listo!'}</Text>
        <Text style={styles.sub}>{faltan ? 'Elegí a quién vas a completar.' : 'Ya están todos. ¡Gracias!'}</Text>

        {padron.map((p) => (
          <Pressable
            key={p.socio}
            testID={`socio-${p.socio}`}
            accessibilityRole="button"
            onPress={() => navigation.navigate('Ficha', { persona: p })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {p.nombre} {p.apellido}
              </Text>
              {p.division || p.deporte === 'rugby_inclusivo' ? <Text style={styles.desc}>{p.division ?? 'Rugby inclusivo'}</Text> : null}
            </View>
            {p.cargado ? <Text style={styles.done}>✓ Listo</Text> : <Text style={styles.go}>›</Text>}
          </Pressable>
        ))}

        {agregados.map((r) => (
          <Pressable key={r.id} testID={`editar-${r.id}`} accessibilityRole="button" onPress={() => navigation.navigate('Ficha', { registro: r })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {r.nombre} {r.apellido}
              </Text>
              {r.division ? <Text style={styles.desc}>{r.division}</Text> : null}
            </View>
            <Text style={styles.done}>✓ Listo</Text>
          </Pressable>
        ))}

        <View style={styles.otro}>
          <Button testID="agregar-otro" label="Agregar otro jugador" variant="outline" onPress={() => navigation.navigate('Ficha', { cargaPara: 'companero', volver: true })} />
        </View>

        <View style={styles.footer}>
          <CuentaFooter />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { paddingHorizontal: 22, alignItems: 'center', flexGrow: 1 },
  inner: { width: '100%', maxWidth: 520, flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 18 },
  title: { ...display(36), color: colors.navy },
  sub: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  name: { fontFamily: fonts.bold, fontSize: 17, color: colors.navy },
  desc: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  done: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.success },
  go: { fontSize: 28, lineHeight: 30, color: colors.celeste },
  otro: { marginTop: 8 },
  footer: { marginTop: 'auto', paddingTop: 32, gap: 8 },
});
