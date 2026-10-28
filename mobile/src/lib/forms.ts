import { isValidDni, isValidEmail, isValidPhone, parseDate } from './validation';

/** Para quién se cargan los datos: uno mismo, un hijo/a, o un compañero/a que no tiene la app. */
export type CargaPara = 'yo' | 'hijo' | 'companero';
export type Deporte = 'rugby' | 'hockey' | 'rugby_inclusivo';
export type Vinculo = 'familiar' | 'socio' | 'ex_jugador' | 'amigo' | 'otro';

export type JugadorForm = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string; // DD/MM/AAAA tal como se tipea
  deporte: Deporte | null;
  division: string;
  colegio: string;
  localidad: string;
  domicilio: string;
  telefono: string;
  email: string;
  familiaEnClub: string;
  contento: number | null;
  conoceQuienDejo: boolean | null;
  quienDejoDetalle: string;
};

export type ComunidadForm = {
  nombre: string;
  apellido: string;
  vinculo: Vinculo | null;
  vinculoDetalle: string;
  telefono: string;
  email: string;
  comentarios: string;
};

export const emptyJugador = (prefill: Partial<JugadorForm> = {}): JugadorForm => ({
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  deporte: null,
  division: '',
  colegio: '',
  localidad: '',
  domicilio: '',
  telefono: '',
  email: '',
  familiaEnClub: '',
  contento: null,
  conoceQuienDejo: null,
  quienDejoDetalle: '',
  ...prefill,
});

export const emptyComunidad = (prefill: Partial<ComunidadForm> = {}): ComunidadForm => ({
  nombre: '',
  apellido: '',
  vinculo: null,
  vinculoDetalle: '',
  telefono: '',
  email: '',
  comentarios: '',
  ...prefill,
});

export type Errors = Partial<Record<string, string>>;

/** Campos de cada paso del cuestionario (para validar por paso y saltar al paso con error). */
export const JUGADOR_STEPS: (keyof JugadorForm)[][] = [
  ['nombre', 'apellido', 'dni', 'fechaNacimiento'],
  ['deporte', 'division', 'colegio', 'localidad', 'domicilio'],
  ['telefono', 'email', 'familiaEnClub', 'contento', 'conoceQuienDejo', 'quienDejoDetalle'],
];

/** Solo nombre y apellido son obligatorios; el resto se valida si está cargado. */
export function validateJugador(f: JugadorForm, step?: number): Errors {
  const e: Errors = {};
  if (!f.nombre.trim()) e.nombre = 'Contanos el nombre';
  if (!f.apellido.trim()) e.apellido = 'Contanos el apellido';
  if (!isValidDni(f.dni)) e.dni = 'El DNI tiene 7 u 8 números';
  if (f.fechaNacimiento.trim() && !parseDate(f.fechaNacimiento)) e.fechaNacimiento = 'Usá el formato DD/MM/AAAA';
  if (!isValidPhone(f.telefono)) e.telefono = 'Revisá el teléfono (con código de área)';
  if (!isValidEmail(f.email)) e.email = 'Revisá el mail';
  if (step === undefined) return e;
  const keys = JUGADOR_STEPS[step] as string[];
  return Object.fromEntries(Object.entries(e).filter(([k]) => keys.includes(k)));
}

export function validateComunidad(f: ComunidadForm): Errors {
  const e: Errors = {};
  if (!f.nombre.trim()) e.nombre = 'Contanos tu nombre';
  if (!f.apellido.trim()) e.apellido = 'Contanos tu apellido';
  if (!isValidPhone(f.telefono)) e.telefono = 'Revisá el teléfono (con código de área)';
  if (!isValidEmail(f.email)) e.email = 'Revisá el mail';
  return e;
}

/** Primer paso (0..2) que contiene alguno de los campos con error, o -1. */
export function firstStepWithError(errors: Errors): number {
  return JUGADOR_STEPS.findIndex((keys) => keys.some((k) => errors[k as string]));
}
