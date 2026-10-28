// Carga el padrón (JSON de padron_xls_a_json.py) en la base: Neon si DATABASE_URL apunta ahí, si no PGlite local.
//   npx tsx --env-file-if-exists=.env.local scripts/importar-padron.ts /tmp/padron.json
import fs from "node:fs";
import { reemplazarPadron, type PadronInput } from "../src/lib/padron";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Uso: importar-padron.ts <padron.json>");
  const filas = JSON.parse(fs.readFileSync(file, "utf8")) as PadronInput[];
  const n = await reemplazarPadron(filas);
  console.log(`Padrón cargado: ${n} socios (${filas.filter((f) => f.email).length} con mail)`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
