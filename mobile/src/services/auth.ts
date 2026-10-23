import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { API_URL } from '../config';

/** URL de la página de login del backend, que vuelve a `redirectUri?token=...`. */
export function buildLoginUrl(apiUrl: string, redirectUri: string): string {
  return `${apiUrl.replace(/\/+$/, '')}/mobile/login?redirect=${encodeURIComponent(redirectUri)}`;
}

/** Saca un parámetro de query (o fragmento) de cualquier URL, incluso esquemas custom (appdelsur://, exp://). */
export function getUrlParam(url: string, name: string): string | null {
  const re = new RegExp(`[?&#]${name}=([^&#]*)`);
  const m = url.match(re);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1].replace(/\+/g, ' '));
  } catch {
    return m[1];
  }
}

export function parseTokenFromRedirect(url: string): string | null {
  const token = getUrlParam(url, 'token');
  return token && token.length > 0 ? token : null;
}

export class LoginCancelled extends Error {
  constructor() {
    super('cancelado');
  }
}

/**
 * En web no usamos popup (los navegadores de celular los bloquean): la página entera va al login
 * y vuelve a la raíz con `?token=`, que `takeTokenFromLocation` levanta al arrancar.
 */
export function takeTokenFromLocation(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const token = parseTokenFromRedirect(window.location.href);
  if (token) window.history.replaceState(null, '', window.location.pathname);
  return token;
}

/** Abre el navegador con el login del backend (Google) y devuelve el token de app. */
export async function loginWithBrowser(): Promise<string> {
  if (Platform.OS === 'web') {
    window.location.replace(buildLoginUrl(API_URL, `${window.location.origin}/`));
    return new Promise<string>(() => {}); // la página se va; no vuelve acá
  }
  const redirectUri = Linking.createURL('auth');
  const result = await WebBrowser.openAuthSessionAsync(buildLoginUrl(API_URL, redirectUri), redirectUri);
  if (result.type !== 'success') throw new LoginCancelled();
  const token = parseTokenFromRedirect(result.url);
  if (!token) {
    const err = getUrlParam(result.url, 'error');
    throw new Error(err ? `No pudimos entrar (${err}).` : 'No recibimos la sesión. Probá de nuevo.');
  }
  return token;
}
