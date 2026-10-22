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

export function isValidPhone(phone: string): boolean {
  const p = phone.trim();
  if (!p) return true;
  const d = onlyDigits(p);
  return d.length >= 8 && d.length <= 15;
}
