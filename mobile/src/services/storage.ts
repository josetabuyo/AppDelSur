import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'appdelsur.token';

function webStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return webStorage()?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const getToken = () => getItem(TOKEN_KEY);
export const setToken = (token: string) => setItem(TOKEN_KEY, token);
export const clearToken = () => removeItem(TOKEN_KEY);

/** Borrador de la ficha de un socio: se guarda en el teléfono mientras se tipea y se borra al enviar. */
const borradorKey = (socio: string) => `appdelsur.borrador.${socio.replace(/[^\w.-]/g, '_')}`;

export async function getBorrador<T>(socio: string): Promise<T | null> {
  try {
    const raw = await getItem(borradorKey(socio));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setBorrador(socio: string, data: unknown): Promise<void> {
  try {
    await setItem(borradorKey(socio), JSON.stringify(data));
  } catch {
    // sin lugar o sin permiso: el formulario sigue andando, solo no queda el borrador
  }
}

export const clearBorrador = (socio: string) => removeItem(borradorKey(socio)).catch(() => {});
