import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Crest } from '../components/Crest';
import ActualizarScreen from '../screens/ActualizarScreen';
import BienvenidaScreen from '../screens/BienvenidaScreen';
import FichaScreen from '../screens/FichaScreen';
import EnrolamientoScreen from '../screens/EnrolamientoScreen';
import GraciasScreen from '../screens/GraciasScreen';
import InicioScreen from '../screens/InicioScreen';
import PadronScreen from '../screens/PadronScreen';
import SosJugadorScreen from '../screens/SosJugadorScreen';
import { useSession } from '../state/session';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Web: el "atrás" del navegador navega dentro de la app y nunca sale de ella. Sin esto, después del
 * login el historial tiene las páginas de Google y "atrás" lleva a elegir cuenta otra vez.
 * Mantenemos siempre una entrada propia arriba del historial y la reponemos en cada popstate.
 */
function useWebBackInsideApp() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const guard = () => window.history.pushState({ delsur: true }, '', window.location.href);
    guard();
    const onPop = () => {
      guard();
      if (navRef.isReady() && navRef.canGoBack()) navRef.goBack();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}

export default function RootNavigator() {
  const { status, upgradeRequired, padron } = useSession();
  useWebBackInsideApp();

  if (upgradeRequired) return <ActualizarScreen />;
  if (status === 'loading') {
    return (
      <View style={styles.splash}>
        <Crest size={120} />
        <ActivityIndicator color={colors.yellow} style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef} documentTitle={{ formatter: () => 'Del Sur · Rugby y Hockey' }}>
      {/* key: al cambiar de sesión (o al cargarse el padrón) arranca de nuevo desde la pantalla que corresponde. */}
      <Stack.Navigator
        key={status === 'authed' ? (padron.length ? 'padron' : 'comunidad') : 'anon'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: 'slide_from_right' }}
      >
        {status === 'authed' ? (
          <>
            {/* En el padrón (lista blanca de mails): directo a sus datos. Si no, la presentación del club. */}
            {/* Un solo jugador con ese mail: directo a su ficha. Una familia: primero la lista. */}
            {padron.length === 1 ? <Stack.Screen name="Ficha" component={FichaScreen} initialParams={{ persona: padron[0] }} /> : null}
            {padron.length > 1 ? <Stack.Screen name="Padron" component={PadronScreen} /> : null}
            <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
            <Stack.Screen name="SosJugador" component={SosJugadorScreen} />
            {padron.length === 1 ? null : <Stack.Screen name="Ficha" component={FichaScreen} />}
            <Stack.Screen name="Enrolamiento" component={EnrolamientoScreen} />
            <Stack.Screen name="Gracias" component={GraciasScreen} options={{ animation: 'fade', gestureEnabled: false }} />
          </>
        ) : (
          <Stack.Screen name="Inicio" component={InicioScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});
