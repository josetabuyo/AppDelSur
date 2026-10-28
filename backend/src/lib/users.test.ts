import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeAll } from "vitest";
import { eq } from "drizzle-orm";

describe("deleteUserData", () => {
  beforeAll(() => {
    delete process.env.DATABASE_URL;
    process.env.PGLITE_DIR = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "appdelsur-test-")), "db");
  });

  it("borra la cuenta y sus registros, y no toca los de otros", async () => {
    const { getDb, registros, users } = await import("@/db");
    const { upsertUser, deleteUserData } = await import("./users");
    const db = await getDb();
    const a = await upsertUser({ email: "a@delsur.test", name: "A" });
    const b = await upsertUser({ email: "b@delsur.test", name: "B" });
    const base = { carga_para: "yo" as const, tipo: "jugador" as const, apellido: "X" };
    await db.insert(registros).values([{ ...base, user_id: a.id, nombre: "A1" }, { ...base, user_id: a.id, nombre: "A2" }, { ...base, user_id: b.id, nombre: "B1" }]);

    expect(await deleteUserData(a.id)).toEqual({ registros: 2 });
    expect(await db.select().from(users).where(eq(users.id, a.id))).toHaveLength(0);
    expect(await db.select().from(registros).where(eq(registros.user_id, a.id))).toHaveLength(0);
    expect(await db.select().from(registros).where(eq(registros.user_id, b.id))).toHaveLength(1);
  });
});
