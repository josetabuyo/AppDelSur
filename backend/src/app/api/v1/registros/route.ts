import { NextRequest } from "next/server";
import { getDb, registros } from "@/db";
import { authUser, json } from "@/lib/api";
import { validateRegistro, toApiRegistro } from "@/lib/registros";

export async function POST(req: NextRequest) {
  const u = await authUser(req);
  if (!u) return json({ error: "no autorizado" }, 401);
  const body = await req.json().catch(() => null);
  const v = validateRegistro(body);
  if (!v.ok) return json({ error: "validacion", campos: v.campos }, 400);
  const d = v.data;
  const db = await getDb();
  const [row] = await db.insert(registros).values({
    user_id: u.id, carga_para: d.cargaPara, tipo: d.tipo, nombre: d.nombre, apellido: d.apellido,
    dni: d.dni ?? null, fecha_nacimiento: d.fechaNacimiento ?? null, deporte: d.deporte ?? null,
    division: d.division ?? null, colegio: d.colegio ?? null, localidad: d.localidad ?? null,
    domicilio: d.domicilio ?? null, telefono: d.telefono ?? null, email: d.email ?? null,
    familia_en_club: d.familiaEnClub ?? null, contento: d.contento ?? null,
    conoce_quien_dejo: d.conoceQuienDejo ?? null, quien_dejo_detalle: d.quienDejoDetalle ?? null,
    vinculo: d.vinculo ?? null, vinculo_detalle: d.vinculoDetalle ?? null, comentarios: d.comentarios ?? null,
    app_version: req.headers.get("x-app-version"),
  }).returning();
  return json({ registro: toApiRegistro(row) }, 201);
}
