import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BienvenidaScreen from '../src/screens/BienvenidaScreen';
import CuestionarioScreen from '../src/screens/CuestionarioScreen';
import InicioScreen from '../src/screens/InicioScreen';
import PadronScreen from '../src/screens/PadronScreen';
import SosJugadorScreen from '../src/screens/SosJugadorScreen';

const mockLoginGoogle = jest.fn(async () => {});
const mockBorrarCuenta = jest.fn(async () => {});
let mockSession: { status: string; padron: unknown[] } = { status: 'anon', padron: [] };
jest.mock('../src/state/session', () => ({
  useSession: () => ({
    ...mockSession,
    loginGoogle: mockLoginGoogle,
    user: { id: 'u1', email: 'jose@gmail.com', name: 'José Tabuyo', image: null },
    registros: [{ id: 'r1', nombre: 'Juan', apellido: 'Tabuyo', tipo: 'jugador', cargaPara: 'hijo', createdAt: '' }],
    logout: jest.fn(),
    addRegistro: jest.fn(),
    token: 't',
    borrarCuenta: mockBorrarCuenta,
  }),
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const wrap = (ui: React.ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nav = () => ({ navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn(), addListener: jest.fn(() => () => {}) }) as any;

describe('Inicio (sin sesión)', () => {
  it('es mínima: escudo, "La app del club" y entrar con Google directo', async () => {
    mockLoginGoogle.mockClear();
    const navigation = nav();
    await wrap(<InicioScreen navigation={navigation} route={{ key: 'i', name: 'Inicio' } as never} />);
    expect(screen.getByText('La app del club')).toBeTruthy();
    expect(screen.queryByText('RUGBY INCLUSIVO')).toBeNull();
    await fireEvent.press(screen.getByTestId('cta-entrar'));
    expect(mockLoginGoogle).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});

describe('Bienvenida (con sesión, fuera del padrón)', () => {
  it('presenta el club con el rugby inclusivo y "Seguir" va a ¿sos jugador?', async () => {
    mockSession = { status: 'authed', padron: [] };
    const navigation = nav();
    await wrap(<BienvenidaScreen navigation={navigation} route={{ key: 'b', name: 'Bienvenida' } as never} />);
    expect(screen.getByText('Viví el')).toBeTruthy();
    expect(screen.queryByText(/Pumpas/)).toBeNull();
    expect(screen.getByText('RUGBY INCLUSIVO')).toBeTruthy();
    expect(screen.getByText(/Hola José/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cta-seguir'));
    expect(navigation.navigate).toHaveBeenCalledWith('SosJugador');
    mockSession = { status: 'anon', padron: [] };
  });
});

const tomas = { socio: '2-0', nombre: 'Tomás', apellido: 'Tabuyo', categoria: 'Jugadores', dni: '45123456', fechaNacimiento: '2012-03-04', deporte: 'rugby', division: 'M-14', jugador: true, cargado: false };
const jose = { ...tomas, socio: '1-0', nombre: 'José', dni: '25123456', fechaNacimiento: '1978-01-01', division: 'Plantel Superior', cargado: true };

describe('Padrón (lista blanca)', () => {
  it('lista a la familia, marca lo cargado y abre el formulario precargado', async () => {
    mockSession = { status: 'authed', padron: [tomas, jose] };
    const navigation = nav();
    await wrap(<PadronScreen navigation={navigation} route={{ key: 'p', name: 'Padron' } as never} />);
    expect(screen.getByText('Completá tus datos')).toBeTruthy();
    expect(screen.getByText('M-14')).toBeTruthy();
    expect(screen.getByText('✓ Listo')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('socio-2-0'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'hijo', persona: tomas });
    await fireEvent.press(screen.getByTestId('socio-1-0'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'yo', persona: jose });
    await fireEvent.press(screen.getByTestId('sumar-companero'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'companero' });
    expect(screen.getByTestId('borrar-cuenta')).toBeTruthy();
    mockSession = { status: 'anon', padron: [] };
  });

  it('con todo cargado dice ¡Listo!', async () => {
    mockSession = { status: 'authed', padron: [jose] };
    await wrap(<PadronScreen navigation={nav()} route={{ key: 'p', name: 'Padron' } as never} />);
    expect(screen.getByText('¡Listo!')).toBeTruthy();
    mockSession = { status: 'anon', padron: [] };
  });
});

describe('Cuestionario', () => {
  it('desde el padrón saltea "Persona" (ya la sabemos), muestra el resumen y deja editarla', async () => {
    mockSession = { status: 'authed', padron: [tomas] };
    await wrap(<CuestionarioScreen navigation={nav()} route={{ key: 'c', name: 'Cuestionario', params: { cargaPara: 'hijo', persona: tomas } } as never} />);
    expect(screen.getByLabelText('Paso 1 de 2')).toBeTruthy();
    expect(screen.getByText('Tomás Tabuyo')).toBeTruthy();
    expect(screen.getByText('DNI 45123456 · 04/03/2012')).toBeTruthy();
    expect(screen.getByDisplayValue('M-14')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('editar-persona'));
    expect(screen.getByLabelText('Paso 1 de 3')).toBeTruthy();
    expect(screen.getByDisplayValue('45123456')).toBeTruthy();
    mockSession = { status: 'anon', padron: [] };
  });

  it('un compañero arranca vacío y no le preguntamos si está contento', async () => {
    mockSession = { status: 'authed', padron: [] };
    await wrap(<CuestionarioScreen navigation={nav()} route={{ key: 'c', name: 'Cuestionario', params: { cargaPara: 'companero' } } as never} />);
    expect(screen.getByText('Tu compañero/a')).toBeTruthy();
    expect(screen.getByLabelText('Paso 1 de 3')).toBeTruthy();
    expect(screen.queryByDisplayValue('José')).toBeNull();
    mockSession = { status: 'anon', padron: [] };
  });
});

describe('¿Sos jugador?', () => {
  it('borrar la cuenta pide confirmación y se puede cancelar', async () => {
    mockBorrarCuenta.mockClear();
    await wrap(<SosJugadorScreen navigation={nav()} route={{ key: 's', name: 'SosJugador' } as never} />);
    await fireEvent.press(screen.getByTestId('borrar-cuenta'));
    expect(screen.getByText('¿Borrar tu cuenta?')).toBeTruthy();
    expect(screen.getByText(/también los datos de tus hijos/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('borrar-cancelar'));
    expect(screen.queryByText('¿Borrar tu cuenta?')).toBeNull();
    expect(mockBorrarCuenta).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('borrar-cuenta'));
    await fireEvent.press(screen.getByTestId('borrar-confirmar'));
    expect(mockBorrarCuenta).toHaveBeenCalledTimes(1);
  });

  it('si falla el borrado lo dice y deja reintentar', async () => {
    mockBorrarCuenta.mockClear();
    mockBorrarCuenta.mockRejectedValueOnce(new Error('500'));
    await wrap(<SosJugadorScreen navigation={nav()} route={{ key: 's', name: 'SosJugador' } as never} />);
    await fireEvent.press(screen.getByTestId('borrar-cuenta'));
    await fireEvent.press(screen.getByTestId('borrar-confirmar'));
    expect(screen.getByText('No pudimos borrar la cuenta. Probá de nuevo.')).toBeTruthy();
    expect(screen.getByTestId('borrar-confirmar')).toBeTruthy();
  });

  it('ofrece las opciones (también sumar a un compañero) y navega con cargaPara', async () => {
    const navigation = nav();
    await wrap(<SosJugadorScreen navigation={navigation} route={{ key: 's', name: 'SosJugador' } as never} />);
    expect(screen.getByText('Sí, juego')).toBeTruthy();
    expect(screen.getByText('Cargo los datos de mi hijo/a')).toBeTruthy();
    expect(screen.getByText('No juego, soy parte de la comunidad')).toBeTruthy();
    expect(screen.getByText(/Hola José/)).toBeTruthy();
    expect(screen.getByText('Juan Tabuyo')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('opcion-yo'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'yo' });
    await fireEvent.press(screen.getByTestId('opcion-companero'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'companero' });
    await fireEvent.press(screen.getByTestId('opcion-hijo'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'hijo' });
    await fireEvent.press(screen.getByTestId('opcion-comunidad'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Enrolamiento');
  });
});
