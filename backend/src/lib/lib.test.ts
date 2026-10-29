import { describe, it, expect } from "vitest";
import { isAllowedRedirect, withToken } from "./redirect";
import { signAppToken, verifyAppToken } from "./token";
import { validateRegistro } from "./registros";
import { compareVersions, isOutdated } from "./version";

describe("redirect allowlist", () => {
  it.each(["appdelsur://auth", "exp://192.168.1.5:8081/--/auth", "exps://x.exp.direct/--/auth", "http://localhost:8081/auth", "http://127.0.0.1:8081/auth", "http://192.168.0.10:8081/auth", "http://10.0.2.2:8081/auth"])("permite %s", (u) => expect(isAllowedRedirect(u)).toBe(true));
  it.each(["https://evil.com", "http://evil.com", "http://localhost.evil.com/x", "http://localhost@evil.com/x", "javascript:alert(1)", "", null, undefined, "//evil.com", "http://192.168.evil.com"])("rechaza %s", (u) => expect(isAllowedRedirect(u as string)).toBe(false));
  it("agrega token", () => {
    expect(withToken("appdelsur://auth", "a b")).toBe("appdelsur://auth?token=a%20b");
    expect(withToken("http://localhost:8081/auth?x=1", "t")).toBe("http://localhost:8081/auth?x=1&token=t");
  });
});

describe("token", () => {
  it("firma y verifica", async () => {
    const t = await signAppToken({ sub: "u1", email: "a@b.c", name: "A" });
    expect(await verifyAppToken(t)).toEqual({ sub: "u1", email: "a@b.c", name: "A" });
  });
  it("rechaza basura y alterados", async () => {
    expect(await verifyAppToken("nope")).toBeNull();
    const t = await signAppToken({ sub: "u1", email: "a@b.c" });
    expect(await verifyAppToken(t.slice(0, -2) + "xx")).toBeNull();
  });
});

describe("validateRegistro", () => {
  const base = { tipo: "jugador", cargaPara: "yo", nombre: "Juan", apellido: "Pérez" };
  it("acepta mínimo y completo", () => {
    expect(validateRegistro(base).ok).toBe(true);
    expect(validateRegistro({ ...base, dni: "12345678", fechaNacimiento: "2010-05-01", deporte: "rugby", contento: 4, conoceQuienDejo: false }).ok).toBe(true);
  });
  it("acepta cargaPara companero y el nº de socio del padrón", () => {
    const r = validateRegistro({ ...base, cargaPara: "companero", socio: "123-0" });
    expect(r.ok && r.data).toMatchObject({ cargaPara: "companero", socio: "123-0" });
    expect(validateRegistro({ ...base, cargaPara: "vecino" }).ok).toBe(false);
  });

  it("acepta la encuesta de Joel: cómo conoció el club, referido, hermanos y adulto responsable", () => {
    const r = validateRegistro({ ...base, comoConocio: "socio", referidoPor: "Juan Pérez", hermanosProspecto: true, hermanosDetalle: "Sofi, 9, hockey", adultoNombre: "José Tabuyo" });
    expect(r.ok && r.data).toMatchObject({ comoConocio: "socio", referidoPor: "Juan Pérez", hermanosProspecto: true, hermanosDetalle: "Sofi, 9, hockey", adultoNombre: "José Tabuyo" });
    expect(validateRegistro({ ...base, comoConocio: "tiktok" }).ok).toBe(false);
    expect(validateRegistro({ ...base, comoConocio: "otro", comoConocioDetalle: "por un amigo del laburo" }).ok && true).toBe(true);
  });
  it("falta nombre", () => {
    const r = validateRegistro({ ...base, nombre: undefined });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campos.nombre).toBe("requerido");
  });
  it("valida dni, fecha, contento, tipo", () => {
    for (const bad of [{ dni: "12" }, { fechaNacimiento: "01/05/2010" }, { contento: 9 }, { tipo: "otro" }, { deporte: "futbol" }]) {
      expect(validateRegistro({ ...base, ...bad }).ok).toBe(false);
    }
  });
});

describe("versiones", () => {
  it("compara", () => {
    expect(compareVersions("0.1.0", "0.1.0")).toBe(0);
    expect(compareVersions("0.2.0", "0.10.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0", "0.9.9")).toBeGreaterThan(0);
  });
  it("isOutdated", () => {
    expect(isOutdated("0.0.9", "0.1.0")).toBe(true);
    expect(isOutdated("0.1.0", "0.1.0")).toBe(false);
    expect(isOutdated(null, "0.1.0")).toBe(false);
  });
});

describe("redirect al propio origen (app web servida por el backend)", () => {
  it("acepta el mismo origen y rechaza otros", async () => {
    const { isAllowedRedirect } = await import("./redirect");
    expect(isAllowedRedirect("https://appdelsur.vercel.app/", "https://appdelsur.vercel.app")).toBe(true);
    expect(isAllowedRedirect("https://evil.com/", "https://appdelsur.vercel.app")).toBe(false);
    expect(isAllowedRedirect("https://appdelsur.vercel.app.evil.com/", "https://appdelsur.vercel.app")).toBe(false);
  });
});
