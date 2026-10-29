import { isValidDni, isValidEmail, isValidPhone, parseDate } from './validation';

/** Para quién se cargan los datos: uno mismo, un hijo/a, o un compañero/a que no tiene la app. */
export type CargaPara = 'yo' | 'hijo' | 'companero';
export type Deporte = 'rugby' | 'hockey' | 'rugby_inclusivo';
export type Vinculo = 'familiar' | 'socio' | 'ex_jugador' | 'amigo' | 'otro';
export type ComoConocio = 'colegio' | 'instagram' | 'parque' | 'evento' | 'socio' | 'otro';

export type JugadorForm = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string; // DD/MM/AAAA tal como se tipea
  deporte: Deporte | null;
  division: string;
  colegio: string;
  localidad: string; // barrio o localidad
  telefono: string; // WhatsApp (del adulto responsable si es un chico)
  email: string;
  adultoNombre: string;
  comoConocio: ComoConocio | null;
  referidoPor: string;
  comoConocioDetalle: string; // texto libre si eligió "otro"
  hermanos: boolean | null; // hermanos/as de 4 a 18 que no juegan: prospectos
  hermanosDetalle: string;
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
  telefono: '',
  email: '',
  adultoNombre: '',
  comoConocio: null,
  referidoPor: '',
  comoConocioDetalle: '',
  hermanos: null,
  hermanosDetalle: '',
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

/** Solo nombre y apellido son obligatorios; el resto se valida si está cargado. */
export function validateJugador(f: JugadorForm): Errors {
  const e: Errors = {};
  if (!f.nombre.trim()) e.nombre = 'Contanos el nombre';
  if (!f.apellido.trim()) e.apellido = 'Contanos el apellido';
  if (!isValidDni(f.dni)) e.dni = 'El DNI tiene 7 u 8 números';
  if (f.fechaNacimiento.trim() && !parseDate(f.fechaNacimiento)) e.fechaNacimiento = 'Usá el formato DD/MM/AAAA';
  if (!isValidPhone(f.telefono)) e.telefono = 'Revisá el teléfono (con código de área)';
  if (!isValidEmail(f.email)) e.email = 'Revisá el mail';
  return e;
}

export function validateComunidad(f: ComunidadForm): Errors {
  const e: Errors = {};
  if (!f.nombre.trim()) e.nombre = 'Contanos tu nombre';
  if (!f.apellido.trim()) e.apellido = 'Contanos tu apellido';
  if (!isValidPhone(f.telefono)) e.telefono = 'Revisá el teléfono (con código de área)';
  if (!isValidEmail(f.email)) e.email = 'Revisá el mail';
  return e;
}
