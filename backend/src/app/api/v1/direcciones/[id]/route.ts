import { NextRequest } from "next/server";
import { authUser, json } from "@/lib/api";
import { detalle, direccionesDisponible } from "@/lib/direcciones";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!direccionesDisponible()) return json({ error: "no disponible" }, 404);
  if (!(await authUser(req))) return json({ error: "no autorizado" }, 401);
  const { id } = await params;
  try {
    return json({ direccion: await detalle(id, req.nextUrl.searchParams.get("session") ?? "") });
  } catch {
    return json({ error: "no se pudo" }, 502);
  }
}
