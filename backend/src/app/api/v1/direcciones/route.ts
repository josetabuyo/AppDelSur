import { NextRequest } from "next/server";
import { authUser, json } from "@/lib/api";
import { autocompletar, direccionesDisponible } from "@/lib/direcciones";

// Pide sesión: cada búsqueda consume cupo de Google.
export async function GET(req: NextRequest) {
  if (!direccionesDisponible()) return json({ disponible: false, sugerencias: [] });
  if (!(await authUser(req))) return json({ error: "no autorizado" }, 401);
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const session = req.nextUrl.searchParams.get("session") ?? "";
  if (q.length < 3) return json({ disponible: true, sugerencias: [] });
  try {
    return json({ disponible: true, sugerencias: await autocompletar(q, session) });
  } catch {
    return json({ disponible: true, sugerencias: [] });
  }
}
