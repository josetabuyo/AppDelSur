import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeAll } from "vitest";
import { deporteDe, esJugador, parseDivision } from "./padron";

describe("parseDivision", () => {
  it.each([
    ["Rugby > M-16", "rugby", "M-16"],
    ["Hockey > 6ta (2do Año)", "hockey", "6ta (2do Año)"],
    ["Hockey > Plantel Superior", "hockey", "Plantel Superior"],
  ])("%s", (s, deporte, division) => expect(parseDivision(s)).toEqual({ deporte, division }));
  it.each(["", null, "-", "Gym > Libre"])("sin división: %s", (s) => expect(parseDivision(s)).toEqual({ deporte: null, division: null }));
});

describe("esJugador", () => {
  it("por categoría o por división", () => {
    expect(esJugador({ categoria: "Jugadores", divisiones: null })).toBe(true);
    expect(esJugador({ categoria: "Activos", divisiones: "Hockey > Mamis" })).toBe(true);
    expect(esJugador({ categoria: "Acompañante NO socio", divisiones: null })).toBe(false);
    expect(esJugador({ categoria: "Familia R.I", divisiones: null })).toBe(true);
  });
  it("Familia R.I es rugby inclusivo", () => {
    expect(deporteDe({ categoria: "Familia R.I", divisiones: null })).toEqual({ deporte: "rugby_inclusivo", division: null });
    expect(deporteDe({ categoria: "Jugadores", divisiones: "Rugby > M-9" })).toEqual({ deporte: "rugby", division: "M-9" });
    expect(deporteDe({ categoria: "Activos", divisiones: null })).toEqual({ deporte: null, division: null });
  });
});

describe("padronDeEmail", () => {
  beforeAll(() => {
    delete process.env.DATABASE_URL;
    process.env.PGLITE_DIR = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "appdelsur-padron-")), "db");
  });

  it("encuentra a la familia por mail (sin importar mayúsculas), jugadores primero, y marca los ya cargados", async () => {
    const { getDb, registros } = await import("@/db");
    const { reemplazarPadron, padronDeEmail } = await import("./padron");
    const { upsertUser } = await import("./users");
    const n = await reemplazarPadron([
      { socio: "1-0", email: "Flia@Mail.com ", nombre: "Ana", apellido: "Paz", categoria: "Acompañante de socio" },
      { socio: "2-0", email: "flia@mail.com", nombre: "Tomás", apellido: "Paz", categoria: "Jugadores", dni: "45.123.456", fechaNacimiento: "2012-03-04", divisiones: "Rugby > M-14" },
      { socio: "3-0", email: "otro@mail.com", nombre: "Leo", apellido: "Gil", categoria: "Jugadores" },
      { socio: "4-0", email: null, nombre: "Sin", apellido: "Mail" },
    ]);
    expect(n).toBe(4);
    const u = await upsertUser({ email: "flia@mail.com", name: "Ana Paz" });
    await (await getDb()).insert(registros).values({ user_id: u.id, carga_para: "hijo", tipo: "jugador", nombre: "Tomás", apellido: "Paz", socio_nro: "2-0" });

    const p = await padronDeEmail("FLIA@mail.com");
    expect(p.map((x) => x.nombre)).toEqual(["Tomás", "Ana"]);
    expect(p[0]).toMatchObject({ socio: "2-0", dni: "45123456", fechaNacimiento: "2012-03-04", deporte: "rugby", division: "M-14", jugador: true, cargado: true });
    expect(p[1]).toMatchObject({ jugador: false, cargado: false });
    expect(await padronDeEmail("nadie@mail.com")).toEqual([]);
  });

  it("reemplazar el padrón borra el anterior", async () => {
    const { reemplazarPadron, padronDeEmail } = await import("./padron");
    await reemplazarPadron([{ socio: "9-0", email: "nuevo@mail.com", nombre: "N", apellido: "N" }]);
    expect(await padronDeEmail("flia@mail.com")).toEqual([]);
    expect(await padronDeEmail("nuevo@mail.com")).toHaveLength(1);
  });
});
