import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT, generateKeyPair, exportJWK, createLocalJWKSet, type JWTVerifyGetKey } from "jose";
import { verifyAppleIdentityToken } from "./apple";

let priv: CryptoKey;
let keys: JWTVerifyGetKey;
const firmar = (claims: Record<string, unknown>, o: { iss?: string; aud?: string; exp?: string } = {}) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(o.iss ?? "https://appleid.apple.com")
    .setAudience(o.aud ?? "ar.org.delsur.app")
    .setSubject("001234.abcd")
    .setIssuedAt()
    .setExpirationTime(o.exp ?? "10m")
    .sign(priv);

beforeAll(async () => {
  const kp = await generateKeyPair("RS256");
  priv = kp.privateKey;
  const jwk = { ...(await exportJWK(kp.publicKey)), kid: "k1", alg: "RS256" };
  keys = createLocalJWKSet({ keys: [jwk] });
});

describe("verifyAppleIdentityToken", () => {
  it("acepta un token de Apple para la app y normaliza el mail", async () => {
    expect(await verifyAppleIdentityToken(await firmar({ email: "Jose@Privaterelay.AppleID.com" }), keys))
      .toEqual({ sub: "001234.abcd", email: "jose@privaterelay.appleid.com" });
  });
  it("acepta el bundle de la instalación gratis", async () => {
    expect(await verifyAppleIdentityToken(await firmar({ email: "a@b.c" }, { aud: "com.josetabuyo.appdelsur" }), keys)).not.toBeNull();
  });
  it("rechaza otra app, otro emisor, vencido o sin mail", async () => {
    expect(await verifyAppleIdentityToken(await firmar({ email: "a@b.c" }, { aud: "com.otra.app" }), keys)).toBeNull();
    expect(await verifyAppleIdentityToken(await firmar({ email: "a@b.c" }, { iss: "https://evil.example" }), keys)).toBeNull();
    expect(await verifyAppleIdentityToken(await firmar({ email: "a@b.c" }, { exp: "-1m" }), keys)).toBeNull();
    expect(await verifyAppleIdentityToken(await firmar({}), keys)).toBeNull();
    expect(await verifyAppleIdentityToken("basura", keys)).toBeNull();
  });
  it("rechaza un token firmado con otra clave", async () => {
    const otra = await generateKeyPair("RS256");
    const t = await new SignJWT({ email: "a@b.c" }).setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer("https://appleid.apple.com").setAudience("ar.org.delsur.app").setSubject("x").setExpirationTime("10m").sign(otra.privateKey);
    expect(await verifyAppleIdentityToken(t, keys)).toBeNull();
  });
});
