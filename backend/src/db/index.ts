import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export * from "./schema";

type AnyDb = ReturnType<typeof import("drizzle-orm/pglite").drizzle<typeof schema>>;
const g = globalThis as unknown as { __db?: Promise<AnyDb> };

const MIGRATIONS = path.join(process.cwd(), "drizzle");

async function init(): Promise<AnyDb> {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("neon.tech")) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    // Misma API de consultas que pglite para lo que usamos; se tipa como AnyDb.
    return drizzle(neon(url), { schema }) as unknown as AnyDb;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db;
}

/** Cliente de DB (Neon si DATABASE_URL apunta a neon.tech; si no, PGlite local con migraciones al arrancar). */
export function getDb(): Promise<AnyDb> {
  if (!g.__db) g.__db = init().catch((e) => { g.__db = undefined; throw e; });
  return g.__db;
}
