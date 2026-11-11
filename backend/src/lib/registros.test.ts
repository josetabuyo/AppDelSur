import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

describe("guardarRegistro (completar de a partes)", () => {
  beforeAll(() => {
    delete process.env.DATABASE_URL;
    process.env.PGLITE_DIR = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "appdelsur-reg-")), "db");
  });

  const base = { tipo: "jugador", cargaPara: "hijo", nombre: "Tomás", apellido: "Paz" } as const;

  it("por socio del propio padrón: la segunda vez corrige la misma ficha y el padrón la devuelve", async () => {
    const { reemplazarPadron, padronDeEmail } = await import("./padron");
    const { upsertUser } = await import("./users");
    const { guardarRegistro, validateRegistro } = await import("./registros");
    await reemplazarPadron([{ socio: "2-0", email: "flia@mail.com", nombre: "Tomás", apellido: "Paz", categoria: "Jugadores" }]);
    const u = await upsertUser({ email: "flia@mail.com", name: "Ana Paz" });
    const parse = (b: object) => { const v = validateRegistro(b); if (!v.ok) throw new Error(JSON.stringify(v.campos)); return v.data; };

    const a = await guardarRegistro(u, parse({ ...base, socio: "2-0", colegio: "Escuela 5" }), null);
    if ("error" in a) throw new Error();
    expect(a.creado).toBe(true);
    const b = await guardarRegistro(u, parse({ ...base, socio: "2-0", colegio: "Escuela 5", telefono: "+54 9 11 5555-6666" }), null);
    if ("error" in b) throw new Error();
    expect(b.creado).toBe(false);
    expect(b.row.id).toBe(a.row.id);

    const [p] = await padronDeEmail("flia@mail.com");
    expect(p.cargado).toBe(true);
    expect(p.registro).toMatchObject({ id: a.row.id, colegio: "Escuela 5", telefono: "+54 9 11 5555-6666" });
  });

  it("socio de otro mail no pisa su ficha; un id ajeno da no_encontrado", async () => {
    const { upsertUser } = await import("./users");
    const { guardarRegistro, validateRegistro } = await import("./registros");
    const parse = (b: object) => { const v = validateRegistro(b); if (!v.ok) throw new Error(); return v.data; };
    const otro = await upsertUser({ email: "otro@mail.com", name: "Otro" });
    const r = await guardarRegistro(otro, parse({ ...base, socio: "2-0" }), null);
    if ("error" in r) throw new Error();
    expect(r.creado).toBe(true);
    const flia = await upsertUser({ email: "flia@mail.com", name: "Ana Paz" });
    expect(await guardarRegistro(flia, parse({ ...base, id: r.row.id }), null)).toEqual({ error: "no_encontrado" });
    const propio = await guardarRegistro(otro, parse({ ...base, id: r.row.id, colegio: "Otro colegio" }), null);
    expect(propio).toMatchObject({ creado: false, row: { id: r.row.id, colegio: "Otro colegio" } });
  });
});
