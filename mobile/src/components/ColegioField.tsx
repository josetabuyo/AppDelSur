import React from 'react';
import { api } from '../services/api';
import { AutocompleteField } from './AutocompleteField';

/** "COLEGIO PARISH ROBERTSON" → "Colegio Parish Robertson" (el padrón oficial viene en mayúsculas). */
export function nombreColegio(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s("'.-])(\p{L})/gu, (_, sep: string, l: string) => sep + l.toUpperCase())
    .replace(/ (De|Del|La|Las|Los|Y|E|En) /g, (m) => m.toLowerCase());
}

type Props = { label: string; value: string; onChange: (v: string) => void };

/** Colegio de la lista oficial: queda "Colegio Parish Robertson (Monte Grande · Esteban Echeverría)". */
export function ColegioField({ label, value, onChange }: Props) {
  return (
    <AutocompleteField
      testID="colegio"
      highlight
      label={label}
      value={value}
      onChange={onChange}
      buscar={async (q) => (await api.colegios(q)).colegios.map((c) => ({ key: c.nombre + c.lugar, titulo: nombreColegio(c.nombre), detalle: c.lugar }))}
      hint="Buscalo por nombre o localidad. Así llevamos el club a más escuelas."
      hintOtro="Escribí el nombre completo del colegio."
      placeholder="Ej: Parish, Secundaria 5 Monte Grande"
      placeholderOtro="Nombre del colegio"
    />
  );
}

/** Localidad de la Provincia o barrio de CABA: queda "9 de Abril (Esteban Echeverría)" o "Villa Lugano (CABA)". */
export function LocalidadField({ label, value, onChange }: Props) {
  return (
    <AutocompleteField
      testID="localidad"
      optional
      label={label}
      value={value}
      onChange={onChange}
      buscar={async (q) => (await api.localidades(q)).localidades.map((c) => ({ key: c.nombre + c.lugar, titulo: c.nombre, detalle: c.lugar }))}
      hintOtro="Escribí la localidad."
      placeholder="Ej: 9 de Abril, Ciudad Evita, Lugano"
      placeholderOtro="Localidad"
    />
  );
}
