import { eq, inArray } from "drizzle-orm";
import { getDb, padron, registros, type PadronRow } from "@/db";

export type Deporte = "rugby" | "hockey" | "rugby_inclusivo";

/** "Rugby > M-16" → { deporte: "rugby", division: "M-16" }. Vacío o desconocido → nulls. */
export function parseDivision(s: string | null | undefined): { deporte: Deporte | null; division: string | null } {
  const m = /^\s*(rugby|hockey)\s*>\s*(.+?)\s*$/i.exec(s ?? "");
  if (!m) return { deporte: null, division: null };
  return { deporte: m[1].toLowerCase() as Deporte, division: m[2] };
}

/** La categoría "Familia R.I" es la de Rugby Inclusivo (no trae división en el padrón). */
const esRugbyInclusivo = (categoria: string | null) => /\bR\.?\s?I\b/i.test(categoria ?? "");

/** Deporte y división: la división del padrón, o rugby inclusivo por la categoría. */
export function deporteDe(r: Pick<PadronRow, "categoria" | "divisiones">) {
  const d = parseDivision(r.divisiones);
  return d.deporte || !esRugbyInclusivo(r.categoria) ? d : { deporte: "rugby_inclusivo" as const, division: null };
}

/** Juega si su categoría es "Jugadores", es de Rugby Inclusivo o tiene una división asignada. */
export function esJugador(r: Pick<PadronRow, "categoria" | "divisiones">) {
  return /jugador/i.test(r.categoria ?? "") || !!deporteDe(r).deporte;
}

export type PadronPersona = {
  socio: string;
  nombre: string;
  apellido: string;
  categoria: string | null;
  dni: string | null;
  fechaNacimiento: string | null;
  deporte: Deporte | null;
  division: string | null;
  jugador: boolean;
  /** Ya hay un registro cargado para este socio (por cualquiera). */
  cargado: boolean;
};

/** Socios del padrón con ese mail (una familia suele compartirlo), y si ya completaron el formulario. */
export async function padronDeEmail(email: string): Promise<PadronPersona[]> {
  const db = await getDb();
  const rows = await db.select().from(padron).where(eq(padron.email, email.trim().toLowerCase()));
  if (!rows.length) return [];
  const hechos = await db
    .select({ socio: registros.socio_nro })
    .from(registros)
    .where(inArray(registros.socio_nro, rows.map((r) => r.socio_nro)));
  const cargados = new Set(hechos.map((h) => h.socio));
  return rows
    .map((r) => ({
      socio: r.socio_nro,
      nombre: r.nombre,
      apellido: r.apellido,
      categoria: r.categoria,
      dni: r.dni,
      fechaNacimiento: r.fecha_nacimiento,
      ...deporteDe(r),
      jugador: esJugador(r),
      cargado: cargados.has(r.socio_nro),
    }))
    .sort((a, b) => Number(b.jugador) - Number(a.jugador) || a.nombre.localeCompare(b.nombre));
}

export type PadronInput = {
  socio: string; email?: string | null; nombre: string; apellido: string; categoria?: string | null;
  dni?: string | null; fechaNacimiento?: string | null; actividades?: string | null;
  divisiones?: string | null; titularGrupo?: string | null;
};

/** Reemplaza el padrón entero por el nuevo export (los registros no se tocan). */
export async function reemplazarPadron(filas: PadronInput[]) {
  const db = await getDb();
  await db.delete(padron);
  const values = filas.map((f) => ({
    socio_nro: f.socio,
    email: f.email?.trim().toLowerCase() || null,
    nombre: f.nombre.trim(),
    apellido: f.apellido.trim(),
    categoria: f.categoria ?? null,
    dni: f.dni?.replace(/\D/g, "") || null,
    fecha_nacimiento: f.fechaNacimiento ?? null,
    actividades: f.actividades ?? null,
    divisiones: f.divisiones ?? null,
    titular_grupo: f.titularGrupo ?? null,
  }));
  for (let i = 0; i < values.length; i += 200) await db.insert(padron).values(values.slice(i, i + 200));
  return values.length;
}
