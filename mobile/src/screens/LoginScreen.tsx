import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { Stripes } from '../components/Hearts';
import { DEV_LOGIN } from '../config';
import type { ScreenProps } from '../navigation/types';
import { ApiError } from '../services/api';
import { LoginCancelled } from '../services/auth';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

const foto = require('../../assets/fotos/foto-hockey.jpg');

const RAZONES = [
  { emoji: '👥', text: 'Cuántos somos y quiénes están activos' },
  { emoji: '📍', text: 'Dónde vivimos' },
  { emoji: '🎒', text: 'A qué colegio van los chicos' },
];

function GoogleG() {
  return (
    <View style={styles.gWrap}>
      <Text style={styles.g}>G</Text>
    </View>
  );
}

export default function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { loginGoogle, loginDev } = useSession();
  const [busy, setBusy] = useState<'google' | 'dev' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: 'google' | 'dev') => {
    setError(null);
    setBusy(kind);
    try {
      await (kind === 'google' ? loginGoogle() : loginDev());
    } catch (e) {
      if (!(e instanceof LoginCancelled)) {
        setError(e instanceof ApiError && e.status !== 0 ? `No pudimos entrar (error ${e.status}).` : (e as Error).message);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <Image source={foto} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(7,42,79,0.92)', 'rgba(12,60,110,0.80)', colors.navy]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroTop}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Volver">
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Crest size={40} />
          </View>
          <Text style={styles.small}>RUGBY Y HOCKEY</Text>
          <Text style={styles.h1}>Sumate</Text>
          <Text style={styles.h1}>a la vida</Text>
          <Text style={[styles.h1, { color: colors.celeste }]}>de club</Text>
          <View style={{ marginTop: 14 }}>
            <Stripes width={84} />
          </View>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.title}>Queremos conocernos</Text>
          <Text style={styles.p}>
            Del Sur crece y queremos hacerlo bien. Para eso necesitamos saber:
          </Text>
          <View style={styles.list}>
            {RAZONES.map((r) => (
              <View key={r.text} style={styles.item}>
                <View style={styles.itemIcon}>
                  <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
                </View>
                <Text style={styles.itemText}>{r.text}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.p}>
            Con eso vamos a poder <Text style={styles.strong}>hacer crecer el club</Text>. Son un par de preguntas, nada más.
          </Text>

          <View style={{ gap: 12, marginTop: 22 }}>
            <Button
              testID="login-google"
              label="Entrar con Google"
              variant="navy"
              icon={<GoogleG />}
              loading={busy === 'google'}
              disabled={!!busy}
              onPress={() => run('google')}
            />
            {DEV_LOGIN ? (
              <Button
                testID="login-dev"
                label="Entrar de prueba"
                variant="outline"
                loading={busy === 'dev'}
                disabled={!!busy}
                onPress={() => run('dev')}
              />
            ) : null}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.fine}>
            Usamos tu cuenta de Google solo para saber quién sos. Tus datos quedan en el club y no se publican.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  hero: { paddingHorizontal: 24, paddingBottom: 40, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.white, fontSize: 30, lineHeight: 32, marginTop: -3 },
  small: { fontFamily: fonts.black, fontSize: 12, letterSpacing: 2, color: colors.yellow, marginBottom: 6 },
  h1: { ...display(54), color: colors.white },
  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -22,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: { ...display(30), color: colors.navy, marginBottom: 8 },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.text },
  strong: { fontFamily: fonts.bold, color: colors.navy },
  list: { marginVertical: 14, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.celesteSoft, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, fontFamily: fonts.semibold, fontSize: 15.5, color: colors.text },
  gWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  g: { fontFamily: fonts.black, fontSize: 16, color: '#4285F4', marginTop: -1 },
  error: { fontFamily: fonts.medium, color: colors.error, marginTop: 14, textAlign: 'center' },
  fine: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, textAlign: 'center', marginTop: 18, paddingHorizontal: 8 },
});
