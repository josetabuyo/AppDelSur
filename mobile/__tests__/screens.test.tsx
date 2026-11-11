import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BienvenidaScreen from '../src/screens/BienvenidaScreen';
import FichaScreen from '../src/screens/FichaScreen';
import InicioScreen from '../src/screens/InicioScreen';
import PadronScreen from '../src/screens/PadronScreen';

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
const nav = () => ({ navigate: jest.fn(), push: jest.fn(), goBack: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true), addListener: jest.fn(() => () => {}) }) as any;

describe('Inicio (sin sesión)', () => {
  it('es mínima: escudo y entrar con Google, sin textos ni cuentas de prueba', async () => {
    mockLoginGoogle.mockClear();
    const navigation = nav();
    await wrap(<InicioScreen navigation={navigation} route={{ key: 'i', name: 'Inicio' } as never} />);
    expect(screen.getByText('Entrar con Google')).toBeTruthy();
    expect(screen.queryByText('La app del club')).toBeNull();
    expect(screen.queryByTestId('login-dev-socio')).toBeNull();
    await fireEvent.press(screen.getByTestId('cta-entrar'));
    expect(mockLoginGoogle).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});

describe('Bienvenida (con sesión, fuera del padrón)', () => {
  it('arriba "Soy jugador" va directo a la ficha; abajo lo social; Rugby Inclusivo Del Sur y nada de Pumpas', async () => {
    mockSession = { status: 'authed', padron: [] };
    const navigation = nav();
    await wrap(<BienvenidaScreen navigation={navigation} route={{ key: 'b', name: 'Bienvenida' } as never} />);
    expect(screen.getByText(/Hola José/)).toBeTruthy();
    expect(screen.queryByText(/Pumpas/)).toBeNull();
    expect(screen.getByText('Rugby inclusivo')).toBeTruthy();
    // Ya cargó a Juan: arriba están sus jugadores para editar y "Agregar otro jugador".
    expect(screen.queryByTestId('soy-jugador')).toBeNull();
    await fireEvent.press(screen.getByTestId('editar-r1'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Ficha', { registro: expect.objectContaining({ id: 'r1' }) });
    await fireEvent.press(screen.getByTestId('otro-jugador'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Ficha', { cargaPara: 'companero', volver: true });
    await fireEvent.press(screen.getByTestId('ser-parte'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Enrolamiento');
    mockSession = { status: 'anon', padron: [] };
  });

  it('borrar la cuenta pide confirmación y se puede cancelar', async () => {
    mockBorrarCuenta.mockClear();
    await wrap(<BienvenidaScreen navigation={nav()} route={{ key: 'b', name: 'Bienvenida' } as never} />);
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
    await wrap(<BienvenidaScreen navigation={nav()} route={{ key: 'b', name: 'Bienvenida' } as never} />);
    await fireEvent.press(screen.getByTestId('borrar-cuenta'));
    await fireEvent.press(screen.getByTestId('borrar-confirmar'));
    expect(screen.getByText('No pudimos borrar la cuenta. Probá de nuevo.')).toBeTruthy();
    expect(screen.getByTestId('borrar-confirmar')).toBeTruthy();
  });
});

const tomas = { socio: '2-0', nombre: 'Tomás', apellido: 'Tabuyo', categoria: 'Jugadores', dni: '45123456', fechaNacimiento: '2012-03-04', deporte: 'rugby', division: 'M-14', jugador: true, cargado: false };
const jose = { ...tomas, socio: '1-0', nombre: 'José', dni: '25123456', fechaNacimiento: '1978-01-01', division: 'Plantel Superior', cargado: true };

describe('Padrón (lista blanca)', () => {
  it('lista a la familia, marca lo cargado y abre la ficha de cada uno', async () => {
    mockSession = { status: 'authed', padron: [tomas, jose] };
    const navigation = nav();
    await wrap(<PadronScreen navigation={navigation} route={{ key: 'p', name: 'Padron' } as never} />);
    expect(screen.getByText('¿De quién son los datos?')).toBeTruthy();
    expect(screen.getByText('M-14')).toBeTruthy();
    expect(screen.getAllByText('✓ Listo')).toHaveLength(2); // José (padrón) y Juan (agregado a mano)
    await fireEvent.press(screen.getByTestId('editar-r1'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Ficha', { registro: expect.objectContaining({ id: 'r1' }) });
    await fireEvent.press(screen.getByTestId('agregar-otro'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Ficha', { cargaPara: 'companero', volver: true });
    await fireEvent.press(screen.getByTestId('socio-2-0'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Ficha', { persona: tomas });
    await fireEvent.press(screen.getByTestId('socio-1-0'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Ficha', { persona: jose });
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

describe('Ficha (una sola pantalla, campos de Joel)', () => {
  it('del padrón viene precargada y la identidad se puede editar', async () => {
    mockSession = { status: 'authed', padron: [tomas] };
    await wrap(<FichaScreen navigation={nav()} route={{ key: 'f', name: 'Ficha', params: { persona: tomas } } as never} />);
    expect(screen.getByText('Datos de Tomás')).toBeTruthy();
    expect(screen.getByText('04/03/2012 · M-14')).toBeTruthy();
    expect(screen.getByLabelText('¿A qué colegio va?')).toBeTruthy();
    expect(screen.getByDisplayValue('José Tabuyo')).toBeTruthy(); // adulto responsable, de la cuenta de Google
    expect(screen.queryByLabelText('DNI')).toBeNull();
    expect(screen.queryByLabelText(/Paso/)).toBeNull();
    await fireEvent.press(screen.getByTestId('editar-persona'));
    expect(screen.getByDisplayValue('04/03/2012')).toBeTruthy();
    mockSession = { status: 'anon', padron: [] };
  });

  it('pregunta cómo conoció el club (y quién, si fue un socio) y por hermanos que podrían sumarse', async () => {
    mockSession = { status: 'authed', padron: [] };
    await wrap(<FichaScreen navigation={nav()} route={{ key: 'f', name: 'Ficha', params: { cargaPara: 'yo' } } as never} />);
    expect(screen.getByText('Contanos de vos')).toBeTruthy();
    expect(screen.getByDisplayValue('José')).toBeTruthy();
    expect(screen.queryByLabelText('¿Quién?')).toBeNull();
    await fireEvent.press(screen.getByText('Me lo recomendó un socio/a'));
    expect(screen.getByLabelText('¿Quién?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Otro'));
    expect(screen.queryByLabelText('¿Quién?')).toBeNull();
    expect(screen.getByLabelText('¿Cómo?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Sí'));
    expect(screen.getByLabelText('¿Qué edad tienen y qué deporte les interesa?')).toBeTruthy();
    expect(screen.queryByText(/contento/)).toBeNull();
    mockSession = { status: 'anon', padron: [] };
  });

  it('lo ya guardado del socio se muestra para seguir completando', async () => {
    const guardado = { id: 'r9', tipo: 'jugador', cargaPara: 'hijo', socio: '2-0', nombre: 'Tomás', apellido: 'Tabuyo', colegio: 'Escuela N°5 (9 de Abril · Esteban Echeverría)', telefono: '+5491155556666', hermanosProspecto: true, hermanosDetalle: 'Sofi, 9', createdAt: '' };
    const conRegistro = { ...tomas, cargado: true, registro: guardado };
    mockSession = { status: 'authed', padron: [conRegistro] };
    await wrap(<FichaScreen navigation={nav()} route={{ key: 'f', name: 'Ficha', params: { persona: conRegistro } } as never} />);
    expect(screen.getByText(/lo que ya cargaste/)).toBeTruthy();
    expect(screen.getByDisplayValue('+54 9 11 5555-6666')).toBeTruthy();
    expect(screen.getByDisplayValue('Sofi, 9')).toBeTruthy();
    expect(screen.getByText('Guardar')).toBeTruthy();
    mockSession = { status: 'anon', padron: [] };
  });

  it('otro jugador arranca vacío, con el mail de quien carga (se puede cambiar), y vuelve al guardar', async () => {
    mockSession = { status: 'authed', padron: [] };
    const navigation = nav();
    await wrap(<FichaScreen navigation={navigation} route={{ key: 'f', name: 'Ficha', params: { cargaPara: 'companero', volver: true } } as never} />);
    expect(screen.getByText('Otro jugador')).toBeTruthy();
    expect(screen.queryByDisplayValue('José')).toBeNull();
    expect(screen.getByDisplayValue('jose@gmail.com')).toBeTruthy();
    expect(screen.getByText(/Si no, queda el tuyo/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('agregar-otro'));
    expect(navigation.push).toHaveBeenCalledWith('Ficha', { cargaPara: 'companero', volver: true });
    mockSession = { status: 'anon', padron: [] };
  });
});
