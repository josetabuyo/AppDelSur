import type { CargaPara, ComoConocio, ComunidadForm, Deporte, JugadorForm, Vinculo } from './forms';
import { onlyDigits, parseDate } from './validation';

/** Body de POST /api/v1/registros (docs/contrato-api.md). Los opcionales vacíos no se mandan. */
export type RegistroPayload = {
  tipo: 'jugador' | 'comunidad';
  cargaPara: CargaPara;
  /** Nº de socio del padrón, si el registro completa a alguien que ya estaba ahí. */
  socio?: string;
  nombre: string;
  apellido: string;
  dni?: string;
  fechaNacimiento?: string;
  deporte?: Deporte | null;
  division?: string;
  colegio?: string;
  localidad?: string;
  domicilio?: string;
  telefono?: string;
  email?: string;
  familiaEnClub?: string;
  contento?: number | null;
  conoceQuienDejo?: boolean | null;
  quienDejoDetalle?: string;
  adultoNombre?: string;
  comoConocio?: ComoConocio | null;
  referidoPor?: string;
  comoConocioDetalle?: string;
  hermanosProspecto?: boolean | null;
  hermanosDetalle?: string;
  vinculo?: Vinculo | null;
  vinculoDetalle?: string;
  comentarios?: string;
};

const opt = (s: string): string | undefined => {
  const t = s.trim().replace(/\s+/g, ' ');
  return t ? t : undefined;
};

/** Saca las claves undefined para que el JSON quede limpio. */
function compact<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export function buildJugadorPayload(f: JugadorForm, cargaPara: CargaPara, socio?: string): RegistroPayload {
  const dni = onlyDigits(f.dni);
  return compact<RegistroPayload>({
    tipo: 'jugador',
    cargaPara,
    socio,
    nombre: f.nombre.trim(),
    apellido: f.apellido.trim(),
    dni: dni || undefined,
    fechaNacimiento: (f.fechaNacimiento.trim() && parseDate(f.fechaNacimiento)) || undefined,
    deporte: f.deporte,
    division: opt(f.division),
    colegio: opt(f.colegio),
    localidad: opt(f.localidad),
    telefono: opt(f.telefono),
    email: opt(f.email)?.toLowerCase(),
    adultoNombre: cargaPara === 'hijo' ? opt(f.adultoNombre) : undefined,
    comoConocio: f.comoConocio,
    referidoPor: f.comoConocio === 'socio' ? opt(f.referidoPor) : undefined,
    comoConocioDetalle: f.comoConocio === 'otro' ? opt(f.comoConocioDetalle) : undefined,
    hermanosProspecto: f.hermanos,
    hermanosDetalle: f.hermanos ? opt(f.hermanosDetalle) : undefined,
  });
}

export function buildComunidadPayload(f: ComunidadForm): RegistroPayload {
  return compact<RegistroPayload>({
    tipo: 'comunidad',
    cargaPara: 'yo',
    nombre: f.nombre.trim(),
    apellido: f.apellido.trim(),
    vinculo: f.vinculo,
    vinculoDetalle: opt(f.vinculoDetalle),
    telefono: opt(f.telefono),
    email: opt(f.email)?.toLowerCase(),
    comentarios: opt(f.comentarios),
  });
}

/** Separa "José Tabuyo" (nombre de Google) en nombre + apellido para precargar. */
export function splitName(full: string | null | undefined): { nombre: string; apellido: string } {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nombre: '', apellido: '' };
  if (parts.length === 1) return { nombre: parts[0], apellido: '' };
  return { nombre: parts.slice(0, -1).join(' '), apellido: parts[parts.length - 1] };
}
