import { describe, expect, it } from "vitest";
import { buscarColegios, buscarLocalidades } from "./colegios";

describe("buscarColegios", () => {
  it("busca por palabras sueltas, sin importar tildes ni mayúsculas", () => {
    const r = buscarColegios("parish monte grande");
    expect(r[0]).toEqual({ nombre: "COLEGIO PARISH ROBERTSON", lugar: "Monte Grande · Esteban Echeverría" });
    expect(buscarColegios("JAGUEL").length).toBeGreaterThan(0);
  });

  it("los de la zona del club aparecen primero", () => {
    const r = buscarColegios("secundaria 5");
    expect(r.length).toBeGreaterThan(3);
    expect(r[0].lugar).toMatch(/Esteban Echeverría$/);
    expect(r.some((c) => /N°\s?(15|25|85)\b/.test(c.nombre))).toBe(false);
  });

  it("con menos de dos letras no devuelve nada", () => {
    expect(buscarColegios("a")).toEqual([]);
    expect(buscarColegios("  ")).toEqual([]);
  });
});

describe("buscarColegios: alias de la zona", () => {
  it("marista trae el MacNab Bernal de Villa Riachuelo, con el nombre que usa la gente", () => {
    expect(buscarColegios("marista")[0]).toEqual({ nombre: "COLEGIO MARISTA MACNAB BERNAL", lugar: "CABA · Comuna 8" });
    expect(buscarColegios("conser fe 5")[0].nombre).toBe("COLEGIO MARISTA MACNAB BERNAL");
  });

  it("safa trae los Sagrada Familia, primero los de la zona", () => {
    const r = buscarColegios("safa");
    expect(r.length).toBeGreaterThan(1);
    expect(r.every((c) => /SAGRADA FAMILIA/.test(c.nombre))).toBe(true);
    expect(r[0]).toEqual({ nombre: "INSTITUTO SAGRADA FAMILIA", lugar: "CABA · Comuna 8" });
  });
});

describe("buscarLocalidades", () => {
  it("encuentra localidades del conurbano y barrios de CABA, primero las del club", () => {
    expect(buscarLocalidades("9 de abril")[0]).toEqual({ nombre: "9 de Abril", lugar: "Esteban Echeverría" });
    expect(buscarLocalidades("lugano")[0]).toEqual({ nombre: "Villa Lugano", lugar: "CABA" });
    expect(buscarLocalidades("evita")[0]).toEqual({ nombre: "Ciudad Evita", lugar: "La Matanza" });
  });
});

describe("buscarColegios: solo CABA y hasta 20 km", () => {
  it("no trae colegios del interior de la provincia", () => {
    expect(buscarColegios("primaria azul").some((c) => /Azul$/.test(c.lugar))).toBe(false);
    expect(buscarColegios("parish")[0].lugar).toMatch(/Esteban Echeverría$/);
  });
});
