import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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

export default function RootNavigator() {
  const { status, upgradeRequired } = useSession();

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
    <NavigationContainer documentTitle={{ formatter: () => 'Del Sur · Somos familia' }}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: 'slide_from_right' }}>
        {status === 'authed' ? (
          <>
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
