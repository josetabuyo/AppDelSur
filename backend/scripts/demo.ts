// Usuarios falsos de la demo (APK demo con "elegí como quién entrar"). Todos con mail @delsur.dev.
//   npx tsx --env-file=<env de Neon> scripts/demo.ts cargar   → agrega los socios ficticios al padrón (no toca el resto)
//   npx tsx --env-file=<env de Neon> scripts/demo.ts borrar   → borra todo lo de la demo: socios ficticios, sus fichas y los usuarios @delsur.dev
// Antes de salir en serio (Play/App Store con login de Google): `borrar` y sacar DEMO_LOGIN de Vercel.
import fs from "node:fs";
import path from "node:path";
import { inArray, like, or } from "drizzle-orm";
import { getDb, padron, registros, users } from "../src/db";
import { DEMO_DOMINIO } from "../src/lib/users";

type Socio = { socio: string; email: string; nombre: string; apellido: string; categoria: string; dni: string; fechaNacimiento: string; actividades: string | null; divisiones: string | null };
const socios = JSON.parse(fs.readFileSync(path.join(__dirname, "socios-prueba.json"), "utf8")) as Socio[];
if (!socios.every((s) => s.email.endsWith(DEMO_DOMINIO))) throw new Error(`socios-prueba.json tiene mails que no son ${DEMO_DOMINIO}`);
const nros = socios.map((s) => s.socio);

async function main() {
  const db = await getDb();
  const accion = process.argv[2];
  if (accion === "cargar") {
    await db.delete(padron).where(inArray(padron.socio_nro, nros));
    await db.insert(padron).values(socios.map((s) => ({
      socio_nro: s.socio, email: s.email, nombre: s.nombre, apellido: s.apellido, categoria: s.categoria,
      dni: s.dni, fecha_nacimiento: s.fechaNacimiento, actividades: s.actividades, divisiones: s.divisiones, titular_grupo: null,
    })));
    console.log(`Demo: ${socios.length} socios ficticios en el padrón.`);
  } else if (accion === "borrar") {
    const demo = await db.select({ id: users.id }).from(users).where(like(users.email, `%${DEMO_DOMINIO}`));
    const ids = demo.map((u) => u.id);
    const fichas = await db.delete(registros)
      .where(ids.length ? or(inArray(registros.user_id, ids), inArray(registros.socio_nro, nros)) : inArray(registros.socio_nro, nros))
      .returning({ id: registros.id });
    if (ids.length) await db.delete(users).where(inArray(users.id, ids));
    await db.delete(padron).where(inArray(padron.socio_nro, nros));
    console.log(`Demo borrada: ${ids.length} usuarios, ${fichas.length} fichas, ${nros.length} socios ficticios.`);
  } else {
    throw new Error("Uso: demo.ts cargar | borrar");
  }
}
main().then(() => process.exit(0), (e) => { console.error(e.message); process.exit(1); });
