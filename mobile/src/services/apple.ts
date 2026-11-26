import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { api } from './api';
import { LoginCancelled } from './auth';

/** "Iniciar sesión con Apple" solo existe en iPhone (Apple lo exige si la app ofrece entrar con Google). */
export async function appleDisponible(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Abre la hoja de Apple, manda el identityToken al backend y devuelve el token de la app. */
export async function loginWithApple(): Promise<string> {
  let cred: AppleAuthentication.AppleAuthenticationCredential;
  try {
    cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') throw new LoginCancelled();
    throw e;
  }
  if (!cred.identityToken) throw new Error('Apple no devolvió la sesión. Probá de nuevo.');
  // Apple manda el nombre solo la primera vez que alguien entra.
  const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ') || undefined;
  const r = await api.appleLogin(cred.identityToken, name);
  return r.token;
}
