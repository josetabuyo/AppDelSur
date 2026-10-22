import { NextRequest } from "next/server";
import { z } from "zod";
import { json } from "@/lib/api";
import { upsertUser, devLoginEnabled } from "@/lib/users";
import { signAppToken } from "@/lib/token";

export async function POST(req: NextRequest) {
  if (!devLoginEnabled()) return json({ error: "no encontrado" }, 404);
  const body = await req.json().catch(() => null);
  const p = z.object({ email: z.string().email(), name: z.string().optional() }).safeParse(body);
  if (!p.success) return json({ error: "validacion", campos: { email: "requerido" } }, 400);
  const u = await upsertUser({ email: p.data.email, name: p.data.name });
  const token = await signAppToken({ sub: u.id, email: u.email, name: u.name ?? undefined });
  return json({ token, user: { id: u.id, email: u.email, name: u.name, image: u.image } });
}
