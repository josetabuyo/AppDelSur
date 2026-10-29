import { fireEvent, render, screen } from '@testing-library/react-native';
import React, { useState } from 'react';
import { ColegioField, nombreColegio } from '../src/components/ColegioField';
import { DomicilioField } from '../src/components/DomicilioField';

const mockColegios = jest.fn(async (_q: string) => ({ colegios: [{ nombre: 'COLEGIO PARISH ROBERTSON', lugar: 'Monte Grande · Esteban Echeverría' }] }));
const mockDirecciones = jest.fn(async (_t: string, q: string, _s: string) => ({
  disponible: true,
  sugerencias: q ? [{ id: 'p1', nombre: 'Camino de Cintura 9399', lugar: '9 de Abril, Buenos Aires' }] : [],
}));
const mockDireccion = jest.fn(async () => ({ direccion: { domicilio: 'Camino de Cintura 9399', localidad: '9 de Abril', partido: 'Esteban Echeverría', completa: '' } }));
jest.mock('../src/services/api', () => ({
  api: {
    colegios: (q: string) => mockColegios(q),
    direcciones: (t: string, q: string, s: string) => mockDirecciones(t, q, s),
    direccion: () => mockDireccion(),
  },
}));
jest.mock('../src/state/session', () => ({ useSession: () => ({ token: 't' }) }));

function Probar() {
  const [v, setV] = useState('');
  return <ColegioField label="Colegio" value={v} onChange={setV} />;
}

describe('ColegioField', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('nombreColegio pasa las mayúsculas del padrón a título', () => {
    expect(nombreColegio('ESCUELA DE EDUCACIÓN SECUNDARIA N°5')).toBe('Escuela de Educación Secundaria N°5');
  });

  it('busca en la lista oficial y al elegir deja nombre y lugar', async () => {
    await render(<Probar />);
    await fireEvent.changeText(screen.getByLabelText('Colegio'), 'parish');
    await jest.advanceTimersByTimeAsync(300);
    expect(mockColegios).toHaveBeenCalledWith('parish');
    await fireEvent.press(await screen.findByText('Colegio Parish Robertson'));
    expect(screen.getByDisplayValue('Colegio Parish Robertson (Monte Grande · Esteban Echeverría)')).toBeTruthy();
  });

  it('"Otro" deja escribir un colegio que no está', async () => {
    await render(<Probar />);
    await fireEvent.changeText(screen.getByLabelText('Colegio'), 'escuelita');
    await jest.advanceTimersByTimeAsync(300);
    await fireEvent.press(screen.getByTestId('colegio-otro'));
    expect(screen.getByText('Escribí el nombre completo del colegio.')).toBeTruthy();
    expect(screen.queryByTestId('colegio-otro')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Colegio'), 'Escuelita del barrio');
    expect(screen.getByDisplayValue('Escuelita del barrio')).toBeTruthy();
  });

  it('con Google, el domicilio elegido completa también la localidad', async () => {
    let localidad = '';
    function Dom() {
      const [v, setV] = useState('');
      return <DomicilioField label="Domicilio" value={v} onChange={setV} onLocalidad={(l) => (localidad = l)} />;
    }
    await render(<Dom />);
    await jest.advanceTimersByTimeAsync(0);
    await fireEvent.changeText(screen.getByLabelText('Domicilio'), 'cintura 93');
    await jest.advanceTimersByTimeAsync(300);
    await fireEvent.press(await screen.findByText('Camino de Cintura 9399'));
    await jest.advanceTimersByTimeAsync(0);
    expect(screen.getByDisplayValue('Camino de Cintura 9399')).toBeTruthy();
    expect(localidad).toBe('9 de Abril (Esteban Echeverría)');
    expect(screen.getByText('Cambiar')).toBeTruthy();
  });
});
