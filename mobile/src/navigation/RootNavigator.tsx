import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Crest } from '../components/Crest';
import ActualizarScreen from '../screens/ActualizarScreen';
import BienvenidaScreen from '../screens/BienvenidaScreen';
import CuestionarioScreen from '../screens/CuestionarioScreen';
import EnrolamientoScreen from '../screens/EnrolamientoScreen';
import GraciasScreen from '../screens/GraciasScreen';
import LoginScreen from '../screens/LoginScreen';
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
  const { status, upgradeRequired } = useSession();
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
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: 'slide_from_right' }}>
        {status === 'authed' ? (
          <>
            {/* La bienvenida es el inicio siempre, también con sesión: así todos ven las novedades. */}
            <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
            <Stack.Screen name="SosJugador" component={SosJugadorScreen} />
            <Stack.Screen name="Cuestionario" component={CuestionarioScreen} />
            <Stack.Screen name="Enrolamiento" component={EnrolamientoScreen} />
            <Stack.Screen name="Gracias" component={GraciasScreen} options={{ animation: 'fade', gestureEnabled: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});
