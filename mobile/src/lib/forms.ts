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

/** Todo es obligatorio (pedido de Joel y Lucas, 2026-11-13). `adulto`: si carga a un hijo/a, su nombre también. */
export function validateJugador(f: JugadorForm, { adulto = false }: { adulto?: boolean } = {}): Errors {
  const e: Errors = {};
  if (!f.nombre.trim()) e.nombre = 'Contanos el nombre';
  if (!f.apellido.trim()) e.apellido = 'Contanos el apellido';
  if (!f.dni.trim()) e.dni = 'Falta el DNI';
  else if (!isValidDni(f.dni)) e.dni = 'El DNI tiene 7 u 8 números';
  if (!f.fechaNacimiento.trim()) e.fechaNacimiento = 'Falta la fecha de nacimiento';
  else if (!parseDate(f.fechaNacimiento)) e.fechaNacimiento = 'Usá el formato DD/MM/AAAA';
  if (!f.deporte) e.deporte = 'Elegí qué juega';
  if (!f.colegio.trim()) e.colegio = 'Contanos el colegio';
  if (!f.localidad.trim()) e.localidad = 'Contanos el barrio o la localidad';
  if (adulto && !f.adultoNombre.trim()) e.adultoNombre = 'Contanos tu nombre';
  if (!f.telefono.trim()) e.telefono = 'Dejanos un WhatsApp';
  else if (!isValidPhone(f.telefono)) e.telefono = 'Revisá el teléfono (con código de área)';
  if (!f.email.trim()) e.email = 'Falta el mail';
  else if (!isValidEmail(f.email)) e.email = 'Revisá el mail';
  if (!f.comoConocio) e.comoConocio = 'Contanos cómo llegó al club';
  else if (f.comoConocio === 'socio' && !f.referidoPor.trim()) e.referidoPor = 'Contanos quién';
  else if (f.comoConocio === 'otro' && !f.comoConocioDetalle.trim()) e.comoConocioDetalle = 'Contanos cómo';
  if (f.hermanos === null) e.hermanos = 'Elegí sí o no';
  else if (f.hermanos && !f.hermanosDetalle.trim()) e.hermanosDetalle = 'Contanos edad y deporte';
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
