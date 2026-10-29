import { emptyComunidad, emptyJugador, validateComunidad, validateJugador } from '../src/lib/forms';
import { buildComunidadPayload, buildJugadorPayload, splitName } from '../src/lib/payload';

describe('validación de formularios', () => {
  it('solo nombre y apellido son obligatorios', () => {
    expect(validateJugador(emptyJugador())).toEqual({ nombre: expect.any(String), apellido: expect.any(String) });
    expect(validateJugador(emptyJugador({ nombre: 'Juan', apellido: 'Pérez' }))).toEqual({});
  });
  it('valida teléfono y mail si están cargados', () => {
    expect(validateJugador(emptyJugador({ nombre: 'Juan', apellido: 'Pérez', email: 'mal', telefono: '123' }))).toEqual({ email: expect.any(String), telefono: expect.any(String) });
  });
  it('comunidad', () => {
    expect(Object.keys(validateComunidad(emptyComunidad()))).toEqual(['nombre', 'apellido']);
  });
});

describe('payload según contrato', () => {
  it('jugador completo', () => {
    const body = buildJugadorPayload(
      emptyJugador({
        nombre: '  Juan ',
        apellido: 'Pérez',
        dni: '45.123.456',
        fechaNacimiento: '01/02/2015',
        deporte: 'rugby',
        division: 'M10',
        colegio: ' Escuela  N° 12 ',
        localidad: '9 de Abril',
        telefono: '+54 9 11 5555-5555',
        email: 'Mama@Gmail.com',
        adultoNombre: 'Laura Pérez',
        comoConocio: 'socio',
        referidoPor: 'Juan Gómez',
        hermanos: true,
        hermanosDetalle: 'Sofi, 9, hockey',
      }),
      'hijo',
    );
    expect(body).toEqual({
      tipo: 'jugador',
      cargaPara: 'hijo',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '45123456',
      fechaNacimiento: '2015-02-01',
      deporte: 'rugby',
      division: 'M10',
      colegio: 'Escuela N° 12',
      localidad: '9 de Abril',
      telefono: '+54 9 11 5555-5555',
      email: 'mama@gmail.com',
      adultoNombre: 'Laura Pérez',
      comoConocio: 'socio',
      referidoPor: 'Juan Gómez',
      hermanosProspecto: true,
      hermanosDetalle: 'Sofi, 9, hockey',
    });
  });
  it('jugador mínimo: no manda opcionales vacíos, manda nulls explícitos', () => {
    const body = buildJugadorPayload(emptyJugador({ nombre: 'Ana', apellido: 'Gómez', referidoPor: 'x', comoConocioDetalle: 'w', hermanosDetalle: 'y', adultoNombre: 'z' }), 'yo');
    expect(body).toEqual({
      tipo: 'jugador',
      cargaPara: 'yo',
      nombre: 'Ana',
      apellido: 'Gómez',
      deporte: null,
      comoConocio: null,
      hermanosProspecto: null,
    });
  });
  it('"otro" en cómo conoció el club manda el texto libre', () => {
    const body = buildJugadorPayload(emptyJugador({ nombre: 'Ana', apellido: 'Gómez', comoConocio: 'otro', comoConocioDetalle: ' por un amigo del laburo ' }), 'yo');
    expect(body).toMatchObject({ comoConocio: 'otro', comoConocioDetalle: 'por un amigo del laburo' });
    expect(body.referidoPor).toBeUndefined();
  });
  it('comunidad', () => {
    const body = buildComunidadPayload(emptyComunidad({ nombre: 'Marta', apellido: 'Ruiz', vinculo: 'familiar', vinculoDetalle: 'mamá de Juan, M10' }));
    expect(body).toEqual({ tipo: 'comunidad', cargaPara: 'yo', nombre: 'Marta', apellido: 'Ruiz', vinculo: 'familiar', vinculoDetalle: 'mamá de Juan, M10' });
  });
  it('splitName', () => {
    expect(splitName('José Tabuyo')).toEqual({ nombre: 'José', apellido: 'Tabuyo' });
    expect(splitName('María Laura Gómez')).toEqual({ nombre: 'María Laura', apellido: 'Gómez' });
    expect(splitName(null)).toEqual({ nombre: '', apellido: '' });
  });
});
