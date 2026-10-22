import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 9014;

/**
 * Base de la API. Orden:
 * 1. EXPO_PUBLIC_API_URL (prod / override explícito)
 * 2. En nativo en dev: la IP de la Mac que sirve el bundle (hostUri de Expo) → anda en Expo Go por Wi-Fi
 * 3. localhost (web / iOS simulator) o 10.0.2.2 (emulador Android)
 */
export function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri; // ej "192.168.0.10:8081"
    const host = hostUri?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return `http://${host}:${API_PORT}`;
    if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
export const APP_VERSION: string = Constants.expoConfig?.version ?? '0.1.0';
export const DEV_LOGIN = process.env.EXPO_PUBLIC_DEV_LOGIN === '1';
export const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL ?? 'https://appdelsur.vercel.app';
