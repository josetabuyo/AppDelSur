import colegios from "../../data/colegios.json";
import localidades from "../../data/localidades.json";
import { buscador } from "./buscar";

/**
 * Colegios primarios y secundarios de CABA y de la Provincia a menos de 20 km de Capital, del Padrón Oficial de
 * Establecimientos Educativos (Ministerio de Capital Humano, 2025, CC BY 4.0). Se regenera con
 * scripts/colegios_xlsx_a_json.py. Lugar = "Localidad · Partido" o "CABA · Comuna N".
 */

/**
 * Como los conoce la gente de la zona (pedido de Joel, 2026-11-13): el nombre oficial a veces no dice nada.
 * "nombre" reemplaza al oficial en lo que se muestra y se guarda; el oficial sigue sirviendo para buscar.
 */
const ALIAS: { oficial: RegExp; lugar?: RegExp; nombre?: string; buscar: string; primero?: boolean }[] = [
  // Villa Riachuelo, de los Hermanos Maristas; muy importante para el club.
  { oficial: /MACNAB BERNAL/, lugar: /Comuna 8$/, nombre: "COLEGIO MARISTA MACNAB BERNAL", buscar: "marista maristas hermanos macnab bernal villa riachuelo", primero: true },
  // "La SAFA": la de Lugano / Villa Riachuelo primero; las demás Sagrada Familia también salen.
  { oficial: /SAGRADA FAMILIA/, lugar: /Comuna 8$/, buscar: "safa lugano villa riachuelo", primero: true },
  { oficial: /SAGRADA FAMILIA/, buscar: "safa" },
];

function conAlias(c: { n: string; l: string }) {
  const a = ALIAS.find((x) => x.oficial.test(c.n) && (!x.lugar || x.lugar.test(c.l)));
  return a ? { n: a.nombre ?? c.n, l: c.l, a: `${a.buscar} ${c.n}`, p: a.primero } : c;
}

/** Localidades de la Provincia (Georef) y barrios de CABA. Se regenera con scripts/localidades_georef.py. */
export const buscarLocalidades = buscador(localidades);

export const buscarColegios = buscador(colegios.map(conAlias));
