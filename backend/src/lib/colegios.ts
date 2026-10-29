import colegios from "../../data/colegios.json";
import localidades from "../../data/localidades.json";
import { buscador } from "./buscar";

/**
 * Colegios primarios y secundarios de CABA y de la Provincia a menos de 20 km de Capital, del Padrón Oficial de
 * Establecimientos Educativos (Ministerio de Capital Humano, 2025, CC BY 4.0). Se regenera con
 * scripts/colegios_xlsx_a_json.py. Lugar = "Localidad · Partido" o "CABA · Comuna N".
 */
export const buscarColegios = buscador(colegios);

/** Localidades de la Provincia (Georef) y barrios de CABA. Se regenera con scripts/localidades_georef.py. */
export const buscarLocalidades = buscador(localidades);
