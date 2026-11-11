import { NextRequest } from "next/server";
import { authUser, json } from "@/lib/api";
import { guardarRegistro, toApiRegistro, validateRegistro } from "@/lib/registros";

/** Crea la ficha, o la corrige si ya existía (por `id` propio o por socio del padrón del usuario). */
export async function POST(req: NextRequest) {
  const u = await authUser(req);
  if (!u) return json({ error: "no autorizado" }, 401);
  const body = await req.json().catch(() => null);
  const v = validateRegistro(body);
  if (!v.ok) return json({ error: "validacion", campos: v.campos }, 400);
  const r = await guardarRegistro(u, v.data, req.headers.get("x-app-version"));
  if ("error" in r) return json({ error: "no encontrado" }, 404);
  return json({ registro: toApiRegistro(r.row) }, r.creado ? 201 : 200);
}
