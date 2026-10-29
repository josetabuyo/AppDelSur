import { fireEvent, render, screen } from '@testing-library/react-native';
import React, { useState } from 'react';
import { ColegioField, nombreColegio } from '../src/components/ColegioField';

const mockColegios = jest.fn(async (_q: string) => ({ colegios: [{ nombre: 'COLEGIO PARISH ROBERTSON', lugar: 'Monte Grande · Esteban Echeverría' }] }));
jest.mock('../src/services/api', () => ({
  api: {
    colegios: (q: string) => mockColegios(q),
  },
}));

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

  it('"Otro" deja lo tipeado tal cual, y al corregirlo vuelve a sugerir', async () => {
    await render(<Probar />);
    await fireEvent.changeText(screen.getByLabelText('Colegio'), 'Escuelita del barrio');
    await jest.advanceTimersByTimeAsync(300);
    await fireEvent.press(screen.getByTestId('colegio-otro'));
    expect(screen.getByDisplayValue('Escuelita del barrio')).toBeTruthy();
    expect(screen.queryByTestId('colegio-otro')).toBeNull();
    // "Cambiar" deja corregir sin borrar, y mientras se tipea sugiere de nuevo
    await fireEvent.press(screen.getByText('Cambiar'));
    await fireEvent.changeText(screen.getByLabelText('Colegio'), 'parish');
    await jest.advanceTimersByTimeAsync(300);
    expect(await screen.findByText('Colegio Parish Robertson')).toBeTruthy();
  });
});
