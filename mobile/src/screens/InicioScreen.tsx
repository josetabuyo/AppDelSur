import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { DEV_LOGIN } from '../config';
import type { ScreenProps } from '../navigation/types';
import { ApiError } from '../services/api';
import { LoginCancelled } from '../services/auth';
import { useSession } from '../state/session';
import { colors, fonts } from '../theme';

/** Cuentas de prueba (solo con EXPO_PUBLIC_DEV_LOGIN=1): un jugador del padrón, una familia del padrón y alguien fuera. */
const PRUEBAS = [
  { testID: 'login-dev-jugador', label: 'Prueba: jugador en la lista', email: 'jugador@delsur.dev', name: 'Nicolás Paz' },
  { testID: 'login-dev-socio', label: 'Prueba: familia en la lista', email: 'socio@delsur.dev', name: 'Lucía Ferreyra' },
  { testID: 'login-dev-nuevo', label: 'Prueba: mail fuera de la lista', email: 'nuevo@delsur.dev', name: 'Martín Ríos' },
];

function GoogleG() {
  return (
    <View style={styles.gWrap}>
      <Text style={styles.g}>G</Text>
    </View>
  );
}

/** Puerta de entrada: un color, el escudo y "Entrar con Google". Nada más. */
export default function InicioScreen(_: ScreenProps<'Inicio'>) {
  const insets = useSafeAreaInsets();
  const { loginGoogle, loginDev } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (login: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await login();
    } catch (e) {
      if (!(e instanceof LoginCancelled)) {
        setError(e instanceof ApiError && e.status !== 0 ? `No pudimos entrar (error ${e.status}).` : (e as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.center}>
        <Crest size={150} />
      </View>
      <View style={styles.bottom}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button testID="cta-entrar" label="Entrar con Google" variant="light" icon={<GoogleG />} loading={busy} disabled={busy} onPress={() => run(loginGoogle)} />
        {DEV_LOGIN
          ? PRUEBAS.map((p) => (
              <Pressable key={p.testID} testID={p.testID} disabled={busy} onPress={() => run(() => loginDev(p.email, p.name))} accessibilityRole="button">
                <Text style={styles.dev}>{p.label}</Text>
              </Pressable>
            ))
          : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, paddingHorizontal: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 14 },
  gWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DADCE0' },
  g: { fontFamily: fonts.black, fontSize: 15, color: '#4285F4' },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.yellow, textAlign: 'center' },
  dev: { fontFamily: fonts.semibold, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', textDecorationLine: 'underline' },
});
