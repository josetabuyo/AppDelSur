import { NextRequest } from "next/server";
import { z } from "zod";
import { json } from "@/lib/api";
import { upsertUser } from "@/lib/users";
import { signAppToken } from "@/lib/token";
import { verifyAppleIdentityToken } from "@/lib/apple";

/** "Iniciar sesión con Apple" (iPhone): el app manda el identityToken de Apple y recibe el token de la app. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const p = z.object({ identityToken: z.string().min(10), name: z.string().max(200).optional() }).safeParse(body);
  if (!p.success) return json({ error: "validacion", campos: { identityToken: "requerido" } }, 400);
  const apple = await verifyAppleIdentityToken(p.data.identityToken);
  if (!apple) return json({ error: "token de Apple inválido" }, 401);
  const u = await upsertUser({ email: apple.email, name: p.data.name?.trim() || undefined });
  const token = await signAppToken({ sub: u.id, email: u.email, name: u.name ?? undefined });
  return json({ token, user: { id: u.id, email: u.email, name: u.name, image: u.image } });
}
