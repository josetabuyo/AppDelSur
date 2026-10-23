import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { Stripes } from '../components/Hearts';
import { DEV_LOGIN } from '../config';
import type { ScreenProps } from '../navigation/types';
import { LoginCancelled } from '../services/auth';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

const fotos = {
  rugby: require('../../assets/fotos/foto-rugby.jpg'),
  hockey: require('../../assets/fotos/foto-hockey.jpg'),
  cancha: require('../../assets/fotos/foto-cancha.jpg'),
};

const DEPORTES = [
  { emoji: '🏉', label: 'Rugby' },
  { emoji: '🏑', label: 'Hockey' },
  { emoji: '🤝', label: 'Rugby inclusivo' },
];

export default function BienvenidaScreen({ navigation }: ScreenProps<'Bienvenida'>) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const width = Math.min(winW, 520);
  const topH = Math.round(width / 1.75);
  const bottomH = Math.round(width / 2.5);
  const heroH = topH + 3 + bottomH;
  const famSize = Math.min(width * 0.25, 108);
  const { status, user, loginGoogle, freshLogin, clearFreshLogin } = useSession();
  const authed = status === 'authed';

  // Recién logueado: sin pararse en la bienvenida, directo a "¿sos jugador?" (con la bienvenida debajo para volver).
  useEffect(() => {
    if (!authed || !freshLogin) return;
    clearFreshLogin();
    navigation.navigate('SosJugador');
  }, [authed, freshLogin, clearFreshLogin, navigation]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Sumate" entra directo con Google: sin pantalla intermedia. En modo prueba sigue la pantalla de login.
  const sumate = async () => {
    if (authed) return navigation.navigate('SosJugador');
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
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* Collage de fotos reales del club */}
        <View style={{ height: heroH }}>
          <Image source={fotos.rugby} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: topH }} contentFit="cover" />
          <View style={[styles.row2, { top: topH + 3, height: bottomH }]}>
            <Image source={fotos.hockey} style={{ flex: 1.35 }} contentFit="cover" contentPosition="center" />
            <Image source={fotos.cancha} style={{ flex: 1 }} contentFit="cover" contentPosition="center" />
          </View>
          <View style={styles.tint} />
          <LinearGradient
            colors={['rgba(7,42,79,0.8)', 'rgba(7,42,79,0)', 'rgba(12,60,110,0)', 'rgba(12,60,110,0.7)', colors.navy]}
            locations={[0, 0.24, 0.62, 0.88, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.brand, { top: insets.top + 14 }]}>
            <Crest size={46} />
            <View>
              <Text style={styles.brandTop}>DEL SUR</Text>
              <Text style={styles.brandSub}>RUGBY · HOCKEY · ESTEBAN ECHEVERRÍA</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.somos}>Viví el</Text>
          <Text style={[styles.familia, { fontSize: famSize, lineHeight: famSize * 1.02 }]}>Club</Text>
          <Stripes width={96} />
        </View>

        <View style={styles.body}>
          <Text style={styles.lead}>
            Rugby, hockey y rugby inclusivo, para todas las edades. <Text style={styles.leadStrong}>Lanzamos la app del club</Text>: en dos minutos nos contás de vos y el club toma mejores decisiones.
          </Text>

          <LinearGradient colors={[colors.celeste, '#1C7FC0', colors.navy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pumpas}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>RUGBY INCLUSIVO</Text>
            </View>
            <Text style={styles.pumpasTitle}>Juegan todos</Text>
            <Text style={styles.pumpasText}>
              Rugby Inclusivo Del Sur: nuestro equipo, con cancha, camiseta y lugar para cada uno.
            </Text>
            <Text style={styles.trophy}>🤝</Text>
          </LinearGradient>

          <View style={styles.sports}>
            {DEPORTES.map((d) => (
              <View key={d.label} style={styles.sport}>
                <Text style={styles.sportEmoji}>{d.emoji}</Text>
                <Text style={styles.sportLabel}>{d.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.quote}>
            <Text style={styles.quoteText}>Vení a disfrutar el club</Text>
            <Text style={styles.quoteSub}>Camino de Cintura 9399 · 9 de Abril · Parque Indoamericano</Text>
          </View>
        </View>
      </ScrollView>

      <LinearGradient
        colors={['rgba(12,60,110,0)', colors.navy, colors.navy]}
        locations={[0, 0.35, 1]}
        style={[styles.ctaBar, { paddingBottom: insets.bottom + 16 }]}
      >
        {error ? <Text style={styles.ctaError}>{error}</Text> : null}
        <Button label={authed ? 'Entrar' : 'Sumate'} big onPress={sumate} loading={busy} testID="cta-sumate" />
        <Text style={styles.ctaHint}>
          {authed ? `Ya estás adentro${user?.name ? `, ${user.name.split(' ')[0]}` : ''} 💙🤍💛` : 'Entrás con tu cuenta de Google · dos minutos 💙🤍💛'}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  ctaError: { fontFamily: fonts.medium, fontSize: 13, color: colors.yellow, textAlign: 'center', marginBottom: 8 },
  row2: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', gap: 3 },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(42,167,223,0.16)' },
  brand: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTop: { ...display(24), color: colors.white, letterSpacing: 2 },
  brandSub: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)' },
  heroText: { paddingHorizontal: 22, marginTop: -44 },
  somos: { ...display(46), color: colors.white, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 },
  familia: { fontFamily: fonts.display, textTransform: 'uppercase', color: colors.celeste, marginTop: -6, marginBottom: 12, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 16 },
  body: { paddingHorizontal: 22, paddingTop: 16 },
  lead: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 26, color: 'rgba(255,255,255,0.88)' },
  leadStrong: { fontFamily: fonts.bold, color: colors.yellow },
  sports: { flexDirection: 'row', gap: 10, marginTop: 14 },
  sport: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  sportEmoji: { fontSize: 26 },
  sportLabel: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.white, marginTop: 6, textAlign: 'center' },
  pumpas: { marginTop: 20, borderRadius: radius.lg, padding: 22, overflow: 'hidden' },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1.2, color: colors.navyInk },
  pumpasTitle: { ...display(52), color: colors.white, marginTop: 10 },
  pumpasText: { fontFamily: fonts.medium, fontSize: 15.5, lineHeight: 23, color: 'rgba(255,255,255,0.92)', marginTop: 4, maxWidth: '88%' },
  trophy: { position: 'absolute', right: 16, top: 14, fontSize: 40, opacity: 0.95 },
  quote: { marginTop: 26, alignItems: 'center' },
  quoteText: { ...display(30), color: colors.yellow, textAlign: 'center' },
  quoteSub: { fontFamily: fonts.medium, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center' },
  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22, paddingTop: 34, zIndex: 10, elevation: 10 },
  ctaHint: { fontFamily: fonts.semibold, fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 10 },
});
