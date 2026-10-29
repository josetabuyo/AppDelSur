import { isValidDni, isValidEmail, isValidPhone, maskDate, maskPhone, parseDate } from '../src/lib/validation';

describe('DNI', () => {
  it('acepta 7 u 8 dígitos, con o sin puntos', () => {
    expect(isValidDni('45123456')).toBe(true);
    expect(isValidDni('4512345')).toBe(true);
    expect(isValidDni('45.123.456')).toBe(true);
  });
  it('vacío es válido (es opcional)', () => expect(isValidDni('  ')).toBe(true));
  it('rechaza largo incorrecto o letras', () => {
    expect(isValidDni('123456')).toBe(false);
    expect(isValidDni('123456789')).toBe(false);
    expect(isValidDni('4512a456')).toBe(false);
  });
});

describe('fecha DD/MM/AAAA', () => {
  const hoy = new Date(2026, 9, 21);
  it('convierte a YYYY-MM-DD', () => {
    expect(parseDate('01/02/2015', hoy)).toBe('2015-02-01');
    expect(parseDate('9/7/1985', hoy)).toBe('1985-07-09');
  });
  it('rechaza fechas imposibles, futuras o mal formadas', () => {
    expect(parseDate('31/02/2015', hoy)).toBeNull();
    expect(parseDate('29/02/2015', hoy)).toBeNull();
    expect(parseDate('01/13/2015', hoy)).toBeNull();
    expect(parseDate('22/10/2026', hoy)).toBeNull();
    expect(parseDate('01/01/1850', hoy)).toBeNull();
    expect(parseDate('2015-02-01', hoy)).toBeNull();
    expect(parseDate('', hoy)).toBeNull();
  });
  it('acepta bisiestos y hoy', () => {
    expect(parseDate('29/02/2016', hoy)).toBe('2016-02-29');
    expect(parseDate('21/10/2026', hoy)).toBe('2026-10-21');
  });
  it('máscara mientras se tipea', () => {
    expect(maskDate('0')).toBe('0');
    expect(maskDate('010')).toBe('01/0');
    expect(maskDate('01022015')).toBe('01/02/2015');
    expect(maskDate('01/02/2015999')).toBe('01/02/2015');
  });
});

describe('contacto', () => {
  it('mail', () => {
    expect(isValidEmail('')).toBe(true);
    expect(isValidEmail('jose@gmail.com')).toBe(true);
    expect(isValidEmail('jose@gmail')).toBe(false);
  });
  it('teléfono', () => {
    expect(isValidPhone('11 5555-5555')).toBe(true);
    expect(isValidPhone('+54 9 11 5555 5555')).toBe(true);
    expect(isValidPhone('1234')).toBe(false);
    expect(isValidPhone('011 15 5555 5555')).toBe(false);
  });
  it('máscara de teléfono: solo números, con +54 9', () => {
    expect(maskPhone('1155556666')).toBe('+54 9 11 5555-6666');
    expect(maskPhone('2215556666')).toBe('+54 9 221 555-6666');
    expect(maskPhone('11abc55')).toBe('+54 9 11 55');
    expect(maskPhone('+54 9 11 5555-6666')).toBe('+54 9 11 5555-6666');
    expect(maskPhone('011 5555 6666')).toBe('+54 9 11 5555-6666');
    expect(maskPhone('+54 9 11 5555-66667')).toBe('+54 9 11 5555-6666');
    // borrar todo deja el campo vacío, no "+54 9"
    expect(maskPhone('+54 9 ')).toBe('');
    expect(maskPhone('+54 9 1')).toBe('+54 9 1');
  });
});
