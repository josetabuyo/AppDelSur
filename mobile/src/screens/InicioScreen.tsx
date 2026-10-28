import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { DEV_LOGIN } from '../config';
import type { ScreenProps } from '../navigation/types';
import { LoginCancelled } from '../services/auth';
import { useSession } from '../state/session';
import { colors, display, fonts } from '../theme';

const foto = require('../../assets/fotos/foto-rugby.jpg');

/**
 * Puerta de entrada, mínima: escudo, una foto y "Entrar". Lo institucional se muestra después del login
 * y solo a quien no está en el padrón del club; los jugadores van directo a sus datos.
 */
export default function InicioScreen({ navigation }: ScreenProps<'Inicio'>) {
  const insets = useSafeAreaInsets();
  const { loginGoogle } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = async () => {
    if (DEV_LOGIN) return navigation.navigate('Login');
    setError(null);
    setBusy(true);
    try {
      await loginGoogle();
    } catch (e) {
      if (!(e instanceof LoginCancelled)) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Image source={foto} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(7,42,79,0.55)', 'rgba(7,42,79,0.15)', 'rgba(12,60,110,0.85)', colors.navy]}
        locations={[0, 0.3, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.top}>
          <Crest size={96} />
          <Text style={styles.brand}>DEL SUR</Text>
          <Text style={styles.sub}>RUGBY · HOCKEY · RUGBY INCLUSIVO</Text>
        </View>
        <View>
          <Text style={styles.title}>La app del club</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button testID="cta-entrar" label="Entrar con Google" big onPress={entrar} loading={busy} />
          <Text style={styles.hint}>Un minuto · tus datos quedan en el club</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  inner: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { alignItems: 'center' },
  brand: { ...display(44), color: colors.white, letterSpacing: 3, marginTop: 14 },
  sub: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  title: { ...display(40), color: colors.white, textAlign: 'center', marginBottom: 18 },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.yellow, textAlign: 'center', marginBottom: 8 },
  hint: { fontFamily: fonts.semibold, fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 10 },
});
