import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

/** Bundles que pueden pedir sesión con Apple: el de las tiendas y el de la instalación gratis en el iPhone de José. */
export const APPLE_AUDIENCES = ["ar.org.delsur.app", "com.josetabuyo.appdelsur"];
const APPLE_ISSUER = "https://appleid.apple.com";

let remote: JWTVerifyGetKey | null = null;
const appleKeys = () => (remote ??= createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys")));

export interface AppleIdentity { sub: string; email: string }

/** Valida el identityToken que devuelve "Iniciar sesión con Apple" en el iPhone (firma de Apple, emisor, app y vencimiento). */
export async function verifyAppleIdentityToken(token: string, keys: JWTVerifyGetKey = appleKeys()): Promise<AppleIdentity | null> {
  try {
    const { payload } = await jwtVerify(token, keys, { issuer: APPLE_ISSUER, audience: APPLE_AUDIENCES, algorithms: ["RS256"] });
    if (!payload.sub || typeof payload.email !== "string" || !payload.email) return null;
    return { sub: payload.sub, email: payload.email.toLowerCase() };
  } catch {
    return null;
  }
}
