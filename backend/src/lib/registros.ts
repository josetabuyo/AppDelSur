import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, padron, registros } from "@/db";

const txt = z.string().trim().max(500).optional().nullable().transform((v) => (v ? v : null));
const req = z.string({ error: "requerido" }).trim().min(1, "requerido").max(200);

export const registroSchema = z.object({
  /** Si viene, corrige ese registro (propio) en vez de crear otro. */
  id: z.string().uuid("invalido").optional().nullable(),
  tipo: z.enum(["jugador", "comunidad"], { error: "invalido" }),
  cargaPara: z.enum(["yo", "hijo", "companero"], { error: "invalido" }),
  socio: z.string().trim().max(40).optional().nullable().transform((v) => (v ? v : null)),
  nombre: req,
  apellido: req,
  dni: z.string().trim().regex(/^\d{7,8}$/, "dni invalido (7-8 digitos)").optional().nullable().or(z.literal("").transform(() => null)),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "formato YYYY-MM-DD").refine((s) => !isNaN(Date.parse(s)), "fecha invalida").optional().nullable().or(z.literal("").transform(() => null)),
  deporte: z.enum(["rugby", "hockey", "rugby_inclusivo"]).optional().nullable(),
  division: txt, colegio: txt, localidad: txt, domicilio: txt, telefono: txt,
  email: z.string().trim().email("email invalido").max(200).optional().nullable().or(z.literal("").transform(() => null)),
  familiaEnClub: txt,
  contento: z.number().int().min(1).max(5).optional().nullable(),
  conoceQuienDejo: z.boolean().optional().nullable(),
  quienDejoDetalle: txt,
  vinculo: z.enum(["familiar", "socio", "ex_jugador", "amigo", "otro"]).optional().nullable(),
  vinculoDetalle: txt,
  comentarios: z.string().trim().max(2000).optional().nullable().transform((v) => (v ? v : null)),
  comoConocio: z.enum(["colegio", "instagram", "parque", "evento", "socio", "otro"], { error: "invalido" }).optional().nullable(),
  referidoPor: txt,
  comoConocioDetalle: txt,
  hermanosProspecto: z.boolean().optional().nullable(),
  hermanosDetalle: txt,
  adultoNombre: txt,
});
export type RegistroInput = z.infer<typeof registroSchema>;

/** Devuelve {ok,data} o {ok:false,campos} con el formato del contrato. */
export function validateRegistro(body: unknown):
  | { ok: true; data: RegistroInput }
  | { ok: false; campos: Record<string, string> } {
  const r = registroSchema.safeParse(body);
  if (r.success) return { ok: true, data: r.data };
  const campos: Record<string, string> = {};
  for (const i of r.error.issues) {
    const k = String(i.path[0] ?? "body");
    if (!campos[k]) campos[k] = i.message === "Invalid input: expected string, received undefined" ? "requerido" : i.message;
  }
  return { ok: false, campos };
}

import type { RegistroRow } from "@/db/schema";
export function toApiRegistro(r: RegistroRow) {
  return {
    id: r.id, tipo: r.tipo, cargaPara: r.carga_para, nombre: r.nombre, apellido: r.apellido,
    dni: r.dni, fechaNacimiento: r.fecha_nacimiento, deporte: r.deporte, division: r.division,
    colegio: r.colegio, localidad: r.localidad, domicilio: r.domicilio, telefono: r.telefono,
    email: r.email, familiaEnClub: r.familia_en_club, contento: r.contento,
    conoceQuienDejo: r.conoce_quien_dejo, quienDejoDetalle: r.quien_dejo_detalle,
    vinculo: r.vinculo, vinculoDetalle: r.vinculo_detalle, comentarios: r.comentarios,
    comoConocio: r.como_conocio, referidoPor: r.referido_por, comoConocioDetalle: r.como_conocio_detalle, hermanosProspecto: r.hermanos_prospecto,
    hermanosDetalle: r.hermanos_detalle, adultoNombre: r.adulto_nombre,
    socio: r.socio_nro, appVersion: r.app_version, createdAt: r.created_at.toISOString(),
  };
}

/** Columnas de la tabla a partir de lo validado (sin id, usuario ni fechas). */
function columnas(d: RegistroInput) {
  return {
    carga_para: d.cargaPara, socio_nro: d.socio ?? null, tipo: d.tipo, nombre: d.nombre, apellido: d.apellido,
    dni: d.dni ?? null, fecha_nacimiento: d.fechaNacimiento ?? null, deporte: d.deporte ?? null,
    division: d.division ?? null, colegio: d.colegio ?? null, localidad: d.localidad ?? null,
    domicilio: d.domicilio ?? null, telefono: d.telefono ?? null, email: d.email ?? null,
    familia_en_club: d.familiaEnClub ?? null, contento: d.contento ?? null,
    conoce_quien_dejo: d.conoceQuienDejo ?? null, quien_dejo_detalle: d.quienDejoDetalle ?? null,
    vinculo: d.vinculo ?? null, vinculo_detalle: d.vinculoDetalle ?? null, comentarios: d.comentarios ?? null,
    como_conocio: d.comoConocio ?? null, referido_por: d.referidoPor ?? null, como_conocio_detalle: d.comoConocioDetalle ?? null,
    hermanos_prospecto: d.hermanosProspecto ?? null, hermanos_detalle: d.hermanosDetalle ?? null,
    adulto_nombre: d.adultoNombre ?? null,
  };
}

/**
 * Guarda una ficha: se puede completar de a partes y volver otro día.
 * - Con `id` corrige ese registro, si es del usuario (si no, "no_encontrado").
 * - Con `socio` de su propio padrón (mismo mail) corrige el último registro de ese socio,
 *   aunque lo haya cargado otra cuenta: hay una sola ficha por socio.
 * - Si no, crea uno nuevo.
 */
export async function guardarRegistro(u: { id: string; email: string }, d: RegistroInput, appVersion: string | null) {
  const db = await getDb();
  const vals = { ...columnas(d), app_version: appVersion };
  let existenteId: string | undefined;
  if (d.id) {
    const [r] = await db.select({ id: registros.id }).from(registros).where(and(eq(registros.id, d.id), eq(registros.user_id, u.id)));
    if (!r) return { error: "no_encontrado" as const };
    existenteId = r.id;
  } else if (d.socio) {
    const [suyo] = await db.select({ socio: padron.socio_nro }).from(padron).where(and(eq(padron.socio_nro, d.socio), eq(padron.email, u.email.trim().toLowerCase())));
    if (suyo) {
      const [r] = await db.select({ id: registros.id }).from(registros).where(eq(registros.socio_nro, d.socio)).orderBy(desc(registros.updated_at)).limit(1);
      existenteId = r?.id;
    }
  }
  if (existenteId) {
    const [row] = await db.update(registros).set({ ...vals, updated_at: new Date() }).where(eq(registros.id, existenteId)).returning();
    return { row, creado: false };
  }
  const [row] = await db.insert(registros).values({ ...vals, user_id: u.id }).returning();
  return { row, creado: true };
}
