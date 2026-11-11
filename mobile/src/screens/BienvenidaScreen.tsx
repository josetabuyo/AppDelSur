import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { CuentaFooter } from '../components/CuentaFooter';
import { Stripes } from '../components/Hearts';
import type { ScreenProps } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

const fotos = {
  rugby: require('../../assets/fotos/foto-rugby.jpg'),
  hockey: require('../../assets/fotos/foto-hockey.jpg'),
  cancha: require('../../assets/fotos/foto-cancha.jpg'),
};

function Foto({ source, alto, titulo, texto }: { source: number; alto: number; titulo: string; texto: string }) {
  return (
    <View style={[styles.foto, { height: alto }]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={['rgba(7,42,79,0)', 'rgba(7,42,79,0.88)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.fotoText}>
        <Text style={styles.fotoTitulo}>{titulo}</Text>
        <Text style={styles.fotoSub}>{texto}</Text>
      </View>
    </View>
  );
}

/**
 * Para quien entra y no está en el padrón. Arriba, el camino del jugador ("Soy jugador", directo a la
 * ficha). Después los banners, de lo deportivo a lo social. Abajo, "Quiero ser parte del club" para la
 * familia, socios, ex jugadores y amigos.
 */
export default function BienvenidaScreen({ navigation }: ScreenProps<'Bienvenida'>) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const alto = Math.round((Math.min(winW, 520) - 44) / 1.6);
  const { user, registros } = useSession();
  const nombre = user?.name?.split(' ')[0];
  const jugadores = registros.filter((r) => r.tipo === 'jugador');

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.body, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <View style={styles.brand}>
          <Crest size={42} />
          <View>
            <Text style={styles.brandTop}>DEL SUR</Text>
            <Text style={styles.brandSub}>RUGBY · HOCKEY · ESTEBAN ECHEVERRÍA</Text>
          </View>
        </View>

        {/* Lo deportivo: el jugador, primero y sin vueltas. */}
        <Text style={styles.hola}>{nombre ? `Hola ${nombre}` : 'Hola'}</Text>
        <Text style={styles.titulo}>¿Jugás o querés jugar?</Text>
        <Button testID="soy-jugador" label="Soy jugador" big onPress={() => navigation.navigate('Ficha', { cargaPara: 'yo' })} />
        <Text testID="otro-jugador" accessibilityRole="button" style={styles.link} onPress={() => navigation.navigate('Ficha', { cargaPara: 'companero' })}>
          Agregar otro jugador (tu hijo/a, un compañero/a)
        </Text>
        {jugadores.length ? (
          <Text style={styles.ya}>
            Ya cargaste:{' '}
            {jugadores.map((r, i) => (
              <Text key={r.id}>
                {i > 0 ? ' · ' : ''}
                <Text testID={`editar-${r.id}`} style={styles.yaLink} onPress={() => navigation.navigate('Ficha', { registro: r })}>
                  {r.nombre} {r.apellido}
                </Text>
              </Text>
            ))}
          </Text>
        ) : null}

        {/* Banners: de lo deportivo a lo social. */}
        <View style={styles.banners}>
          <Foto source={fotos.rugby} alto={alto} titulo="Rugby" texto="Infantiles, juveniles y plantel superior" />
          <Foto source={fotos.hockey} alto={alto} titulo="Hockey" texto="Para todas las edades" />
          <LinearGradient colors={[colors.celeste, '#1C7FC0', colors.navy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inclusivo}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>RUGBY INCLUSIVO DEL SUR</Text>
            </View>
            <Text style={styles.inclusivoTitulo}>Juegan todos</Text>
            <Text style={styles.inclusivoText}>Nuestro equipo, con cancha, camiseta y lugar para cada uno.</Text>
            <Text style={styles.inclusivoEmoji}>🤝</Text>
          </LinearGradient>
          <Foto source={fotos.cancha} alto={alto} titulo="Vení a disfrutar el club" texto="Camino de Cintura 9399 · 9 de Abril · Parque Indoamericano" />
        </View>

        {/* Lo social: familia, socios, ex jugadores, amigos. */}
        <View style={styles.social}>
          <Text style={styles.somos}>Somos familia</Text>
          <Stripes width={96} />
          <Text style={styles.socialText}>¿No jugás pero sos familia, socio/a, ex jugador/a o amigo/a del club? Sumate a la comunidad.</Text>
          <Button testID="ser-parte" label="Quiero ser parte del club" variant="light" onPress={() => navigation.navigate('Enrolamiento')} />
        </View>

        <View style={styles.footer}>
          <CuentaFooter oscuro />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  body: { paddingHorizontal: 22, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 520 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  brandTop: { ...display(24), color: colors.white, letterSpacing: 2 },
  brandSub: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)' },
  hola: { fontFamily: fonts.semibold, fontSize: 16, color: 'rgba(255,255,255,0.75)' },
  titulo: { ...display(40), color: colors.white, marginTop: 2, marginBottom: 18 },
  link: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.celeste, textAlign: 'center', marginTop: 14, textDecorationLine: 'underline' },
  ya: { fontFamily: fonts.medium, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 12 },
  yaLink: { color: colors.white, textDecorationLine: 'underline' },
  banners: { gap: 12, marginTop: 34 },
  foto: { borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  fotoText: { padding: 16 },
  fotoTitulo: { ...display(34), color: colors.white },
  fotoSub: { fontFamily: fonts.medium, fontSize: 13.5, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  inclusivo: { borderRadius: radius.lg, padding: 20, overflow: 'hidden' },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1.2, color: colors.navyInk },
  inclusivoTitulo: { ...display(44), color: colors.white, marginTop: 10 },
  inclusivoText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.92)', marginTop: 4, maxWidth: '85%' },
  inclusivoEmoji: { position: 'absolute', right: 16, top: 14, fontSize: 36 },
  social: { marginTop: 36, gap: 12 },
  somos: { ...display(40), color: colors.yellow },
  socialText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.88)', marginBottom: 6 },
  footer: { marginTop: 32 },
});
