import { SignJWT, jwtVerify } from "jose";

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no configurado");
  return new TextEncoder().encode(s);
};

export interface AppTokenClaims { sub: string; email: string; name?: string }

export async function signAppToken(c: AppTokenClaims): Promise<string> {
  return new SignJWT({ email: c.email, name: c.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(c.sub)
    .setIssuedAt()
    .setExpirationTime("180d")
    .sign(secret());
}

export async function verifyAppToken(token: string): Promise<AppTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email, name: typeof payload.name === "string" ? payload.name : undefined };
  } catch { return null; }
}
