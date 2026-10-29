/** Deja solo dígitos. */
export const onlyDigits = (s: string) => s.replace(/\D+/g, '');

/** DNI argentino: 7 u 8 dígitos (se toleran puntos y espacios al tipear). Vacío = válido (es opcional). */
export function isValidDni(dni: string): boolean {
  const raw = dni.trim();
  if (!raw) return true;
  if (!/^[\d.\s]+$/.test(raw)) return false;
  const d = onlyDigits(raw);
  return d.length === 7 || d.length === 8;
}

/** Máscara mientras se tipea: "01022015" → "01/02/2015". */
export function maskDate(input: string): string {
  const d = onlyDigits(input).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "DD/MM/AAAA" → "YYYY-MM-DD", o null si no es una fecha real y razonable (1900..hoy). */
export function parseDate(input: string, today: Date = new Date()): string | null {
  const m = input.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return null;
  if (year < 1900) return null;
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (dt.getTime() > todayUtc) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isValidEmail(email: string): boolean {
  const e = email.trim();
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

/** Los 10 dígitos de un celular argentino (código de área + número), sin +54, 9, 0 ni 15 adelante. */
export function phoneNational(input: string): string {
  let d = onlyDigits(input);
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

/** Máscara mientras se tipea: solo números, con el +54 9 adelante. "1155556666" → "+54 9 11 5555-6666". */
export function maskPhone(input: string): string {
  const d = phoneNational(input).slice(0, 10);
  if (!d) return '';
  const area = d.startsWith('11') ? 2 : 3;
  const a = d.slice(0, area);
  const n = d.slice(area);
  const corte = n.length - 4;
  const num = n.length > 4 ? `${n.slice(0, corte)}-${n.slice(corte)}` : n;
  return `+54 9 ${a}${num ? ` ${num}` : ''}`;
}

export function isValidPhone(phone: string): boolean {
  if (!phone.trim()) return true;
  return phoneNational(phone).length === 10;
}
