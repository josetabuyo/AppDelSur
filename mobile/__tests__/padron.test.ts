import { cargaParaDe, identidadCompleta, prefillDePadron } from '../src/lib/padron';
import { buildJugadorPayload } from '../src/lib/payload';
import { emptyJugador } from '../src/lib/forms';
import type { PadronPersona } from '../src/services/api';

const p = (o: Partial<PadronPersona>): PadronPersona => ({
  socio: '1-0', nombre: 'Tomás', apellido: 'Paz', categoria: 'Jugadores', dni: '45123456', fechaNacimiento: '2012-03-04',
  deporte: 'rugby', division: 'M-14', jugador: true, cargado: false, ...o,
});
const hoy = new Date(2026, 9, 28);

describe('cargaParaDe', () => {
  it('si el nombre coincide con la cuenta de Google, es "yo" (sin tildes ni mayúsculas)', () => {
    expect(cargaParaDe(p({ nombre: 'Tomas Ignacio' }), 'TOMÁS Paz', hoy)).toBe('yo');
  });
  it('un menor con otro nombre lo carga el padre/madre', () => {
    expect(cargaParaDe(p({}), 'Ana Paz', hoy)).toBe('hijo');
  });
  it('un adulto con otro nombre (o sin fecha) queda como "yo"', () => {
    expect(cargaParaDe(p({ fechaNacimiento: '1990-01-01' }), 'Ana Paz', hoy)).toBe('yo');
    expect(cargaParaDe(p({ fechaNacimiento: null }), null, hoy)).toBe('yo');
  });
  it('cumple 18 justo hoy → ya no es menor', () => {
    expect(cargaParaDe(p({ fechaNacimiento: '2008-10-28' }), 'Ana', hoy)).toBe('yo');
    expect(cargaParaDe(p({ fechaNacimiento: '2008-10-29' }), 'Ana', hoy)).toBe('hijo');
  });
});

describe('prefill y payload', () => {
  it('pasa la fecha a DD/MM/AAAA y manda el nº de socio', () => {
    const f = emptyJugador(prefillDePadron(p({})));
    expect(f).toMatchObject({ nombre: 'Tomás', dni: '45123456', fechaNacimiento: '04/03/2012', deporte: 'rugby', division: 'M-14' });
    expect(buildJugadorPayload(f, 'hijo', '1-0')).toMatchObject({ socio: '1-0', cargaPara: 'hijo', fechaNacimiento: '2012-03-04', dni: '45123456' });
    expect(buildJugadorPayload(f, 'yo')).not.toHaveProperty('socio');
  });
  it('identidad completa solo con DNI y fecha', () => {
    expect(identidadCompleta(p({}))).toBe(true);
    expect(identidadCompleta(p({ dni: null }))).toBe(false);
  });
});
