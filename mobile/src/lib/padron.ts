import type { PadronPersona } from '../services/api';
import type { CargaPara, JugadorForm } from './forms';

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function edad(iso: string | null, hoy = new Date()): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  let e = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) e--;
  return e;
}

/**
 * ¿Quién completa a esta persona del padrón? Si coincide con el nombre de la cuenta de Google es "yo";
 * si es menor, "hijo" (el mail de la familia suele ser del padre o la madre); si no, "yo".
 */
export function cargaParaDe(p: PadronPersona, googleName: string | null | undefined, hoy = new Date()): CargaPara {
  const palabras = new Set(norm(googleName ?? '').split(/\s+/).filter(Boolean));
  const primerNombre = norm(p.nombre).split(/\s+/)[0];
  if (primerNombre && palabras.has(primerNombre)) return 'yo';
  const e = edad(p.fechaNacimiento, hoy);
  return e !== null && e < 18 ? 'hijo' : 'yo';
}

/** Lo que el padrón ya sabe, en el formato del formulario. */
export function prefillDePadron(p: PadronPersona): Partial<JugadorForm> {
  const f = p.fechaNacimiento?.split('-');
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    dni: p.dni ?? '',
    fechaNacimiento: f && f.length === 3 ? `${f[2]}/${f[1]}/${f[0]}` : '',
    deporte: p.deporte,
    division: p.division ?? '',
  };
}

/** Con nombre, DNI y fecha ya cargados en el padrón, el paso "Persona" no hace falta. */
export const identidadCompleta = (p: PadronPersona) => !!(p.nombre && p.apellido && p.dni && p.fechaNacimiento);
