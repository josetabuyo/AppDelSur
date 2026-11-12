import { eq } from "drizzle-orm";
import { getDb, registros, users } from "@/db";

export async function upsertUser(p: { email: string; name?: string | null; image?: string | null; googleSub?: string | null }) {
  const db = await getDb();
  const email = p.email.trim().toLowerCase();
  const existing = (await db.select().from(users).where(eq(users.email, email)))[0];
  if (existing) {
    const [u] = await db.update(users).set({
      name: p.name ?? existing.name, image: p.image ?? existing.image, google_sub: p.googleSub ?? existing.google_sub,
    }).where(eq(users.id, existing.id)).returning();
    return u;
  }
  const [u] = await db.insert(users).values({ email, name: p.name ?? email.split("@")[0], image: p.image ?? null, google_sub: p.googleSub ?? null }).returning();
  return u;
}

/** Dominio de los usuarios falsos de la demo. Se borran con scripts/borrar-demo.ts antes de salir en serio. */
export const DEMO_DOMINIO = "@delsur.dev";

/**
 * Login sin Google ("elegir como quién entrar"). En la Mac, siempre. En la nube, solo con DEMO_LOGIN=1
 * (APK demo) y solo para los usuarios falsos @delsur.dev: nadie puede entrar como un socio real.
 */
export const enLaMac = () => !process.env.VERCEL && process.env.NODE_ENV !== "production";
export const devLoginEnabled = () => enLaMac() || process.env.DEMO_LOGIN === "1";
export const devLoginPermitido = (email: string) => enLaMac() || email.trim().toLowerCase().endsWith(DEMO_DOMINIO);

/** Borra la cuenta y todo lo que cargó (Play exige poder hacerlo desde la app y desde la web). */
export async function deleteUserData(userId: string) {
  const db = await getDb();
  const borrados = await db.delete(registros).where(eq(registros.user_id, userId)).returning({ id: registros.id });
  await db.delete(users).where(eq(users.id, userId));
  return { registros: borrados.length };
}
