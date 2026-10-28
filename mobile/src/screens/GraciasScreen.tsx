import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { Stripes } from '../components/Hearts';
import { SHARE_URL } from '../config';
import type { ScreenProps } from '../navigation/types';
import { colors, display, fonts } from '../theme';

export const SHARE_TEXT =
  `¡Me sumé a la app de Del Sur! 💙🤍💛\n` +
  `Es la app del club, hecha por el club y para el club. En dos minutos el club te conoce y te puede dar más.\n` +
  `Sumate vos también 👉 ${SHARE_URL}`;

export default function GraciasScreen({ navigation, route }: ScreenProps<'Gracias'>) {
  const insets = useSafeAreaInsets();
  const { nombre, tipo, cargaPara } = route.params;
  const hijo = cargaPara === 'hijo';
  const otro = hijo || cargaPara === 'companero';

  const compartir = () => Share.share({ message: SHARE_TEXT }).catch(() => undefined);

  return (
    <LinearGradient colors={[colors.navyDeep, colors.navy, '#13508F']} style={styles.root}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.inner}>
          <Crest size={92} />
          <Text style={styles.kicker}>{otro ? `${nombre.toUpperCase()} YA ES PARTE` : tipo === 'comunidad' ? 'YA SOS PARTE DE LA COMUNIDAD' : 'YA ESTÁS ADENTRO'}</Text>
          <Text style={styles.title}>{otro ? '¡Gracias!' : `¡Gracias, ${nombre}!`}</Text>
          <Stripes width={110} />

          <View style={styles.texts}>
            <Text style={styles.p}>
              Esta es <Text style={styles.strong}>la app del club, hecha por el club y para el club</Text>. Sin otro interés que Del Sur.
            </Text>
            <Text style={styles.p}>
              Con lo que nos contaste, el club te conoce mejor y puede darte más: más profes, más colegios, mejores propuestas, y que
              nadie quede afuera en el camino.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.yellow}>Esto recién empieza.</Text> Después vienen perfiles, asistencia y mucho más. Los que empezamos el
              camino queremos que vengan otros mejores a seguirlo.
            </Text>
            <View style={styles.cierre}>
              <Text style={styles.big}>Más conectados. Más organizados.</Text>
              <Text style={[styles.big, { color: colors.celeste }]}>Más Del Sur</Text>
              <Text style={styles.hearts}>💙🤍💛</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              testID="otro-hijo"
              label={hijo ? 'Cargar otro hijo/a' : 'Cargar a mi hijo/a'}
              onPress={() => navigation.replace('Cuestionario', { cargaPara: 'hijo' })}
            />
            <Button testID="sumar-companero" label="Sumar a un compañero/a" variant="light" onPress={() => navigation.replace('Cuestionario', { cargaPara: 'companero' })} />
            <Button testID="compartir" label="Compartir con otro del club" variant="light" onPress={compartir} />
            <Button label="Listo" variant="ghost" onPress={() => navigation.popToTop()} />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 26, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 520, alignItems: 'center' },
  kicker: { fontFamily: fonts.black, fontSize: 12, letterSpacing: 2, color: colors.celeste, marginTop: 22, textAlign: 'center' },
  title: { ...display(56), color: colors.white, textAlign: 'center', marginTop: 4, marginBottom: 14 },
  texts: { marginTop: 22, gap: 14, alignSelf: 'stretch' },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: 'rgba(255,255,255,0.88)' },
  strong: { fontFamily: fonts.bold, color: colors.white },
  yellow: { fontFamily: fonts.bold, color: colors.yellow },
  cierre: { alignItems: 'center', marginTop: 10 },
  big: { ...display(30), color: colors.white, textAlign: 'center' },
  hearts: { fontSize: 22, marginTop: 6 },
  actions: { alignSelf: 'stretch', gap: 12, marginTop: 28 },
});
