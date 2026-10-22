import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BienvenidaScreen from '../src/screens/BienvenidaScreen';
import SosJugadorScreen from '../src/screens/SosJugadorScreen';

jest.mock('../src/state/session', () => ({
  useSession: () => ({
    user: { id: 'u1', email: 'jose@gmail.com', name: 'José Tabuyo', image: null },
    registros: [{ id: 'r1', nombre: 'Juan', apellido: 'Tabuyo', tipo: 'jugador', cargaPara: 'hijo', createdAt: '' }],
    logout: jest.fn(),
  }),
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const wrap = (ui: React.ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nav = () => ({ navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() }) as any;

describe('Bienvenida', () => {
  it('muestra la identidad del club, el rugby inclusivo y el CTA Sumate', async () => {
    const navigation = nav();
    await wrap(<BienvenidaScreen navigation={navigation} route={{ key: 'b', name: 'Bienvenida' } as never} />);
    expect(screen.getByText('Somos')).toBeTruthy();
    expect(screen.getByText('Familia')).toBeTruthy();
    expect(screen.getByText('Pumpas XV')).toBeTruthy();
    expect(screen.getByText('RUGBY INCLUSIVO')).toBeTruthy();
    expect(screen.getByText(/Vitoria-Gasteiz/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cta-sumate'));
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});

describe('¿Sos jugador?', () => {
  it('ofrece las tres opciones y navega con cargaPara', async () => {
    const navigation = nav();
    await wrap(<SosJugadorScreen navigation={navigation} route={{ key: 's', name: 'SosJugador' } as never} />);
    expect(screen.getByText('Sí, juego')).toBeTruthy();
    expect(screen.getByText('Cargo los datos de mi hijo/a')).toBeTruthy();
    expect(screen.getByText('No juego, soy parte de la comunidad')).toBeTruthy();
    expect(screen.getByText(/Hola José/)).toBeTruthy();
    expect(screen.getByText('Juan Tabuyo')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('opcion-yo'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'yo' });
    await fireEvent.press(screen.getByTestId('opcion-hijo'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Cuestionario', { cargaPara: 'hijo' });
    await fireEvent.press(screen.getByTestId('opcion-comunidad'));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Enrolamiento');
  });
});
