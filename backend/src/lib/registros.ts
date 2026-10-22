import { z } from "zod";

const txt = z.string().trim().max(500).optional().nullable().transform((v) => (v ? v : null));
const req = z.string({ error: "requerido" }).trim().min(1, "requerido").max(200);

export const registroSchema = z.object({
  tipo: z.enum(["jugador", "comunidad"], { error: "invalido" }),
  cargaPara: z.enum(["yo", "hijo"], { error: "invalido" }),
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
    appVersion: r.app_version, createdAt: r.created_at.toISOString(),
  };
}
