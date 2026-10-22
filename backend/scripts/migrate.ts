import path from "node:path";
const url = process.env.DATABASE_URL ?? "";
async function main() {
  if (url.includes("neon.tech")) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(drizzle(neon(url)), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("Migraciones aplicadas en Neon");
  } else {
    const { getDb } = await import("../src/db");
    await getDb();
    console.log("Migraciones aplicadas en PGlite (.data/pglite)");
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
