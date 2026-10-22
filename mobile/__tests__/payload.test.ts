import { emptyComunidad, emptyJugador, firstStepWithError, validateComunidad, validateJugador } from '../src/lib/forms';
import { buildComunidadPayload, buildJugadorPayload, splitName } from '../src/lib/payload';

describe('validación de formularios', () => {
  it('solo nombre y apellido son obligatorios', () => {
    expect(validateJugador(emptyJugador())).toEqual({ nombre: expect.any(String), apellido: expect.any(String) });
    expect(validateJugador(emptyJugador({ nombre: 'Juan', apellido: 'Pérez' }))).toEqual({});
  });
  it('valida por paso y ubica el primer paso con error', () => {
    const f = emptyJugador({ nombre: 'Juan', apellido: 'Pérez', email: 'mal' });
    expect(validateJugador(f, 0)).toEqual({});
    expect(validateJugador(f, 2)).toEqual({ email: expect.any(String) });
    expect(firstStepWithError(validateJugador(f))).toBe(2);
    expect(firstStepWithError({ dni: 'x' })).toBe(0);
    expect(firstStepWithError({})).toBe(-1);
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
        telefono: '11 5555 5555',
        email: 'Mama@Gmail.com',
        familiaEnClub: 'hermano en M12',
        contento: 5,
        conoceQuienDejo: true,
        quienDejoDetalle: 'Tomi, se mudó',
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
      telefono: '11 5555 5555',
      email: 'mama@gmail.com',
      familiaEnClub: 'hermano en M12',
      contento: 5,
      conoceQuienDejo: true,
      quienDejoDetalle: 'Tomi, se mudó',
    });
  });
  it('jugador mínimo: no manda opcionales vacíos, manda nulls explícitos', () => {
    const body = buildJugadorPayload(emptyJugador({ nombre: 'Ana', apellido: 'Gómez', quienDejoDetalle: 'x' }), 'yo');
    expect(body).toEqual({
      tipo: 'jugador',
      cargaPara: 'yo',
      nombre: 'Ana',
      apellido: 'Gómez',
      deporte: null,
      contento: null,
      conoceQuienDejo: null,
    });
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
