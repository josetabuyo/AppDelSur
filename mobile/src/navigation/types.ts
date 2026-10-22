import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CargaPara } from '../lib/forms';

export type RootStackParamList = {
  Bienvenida: undefined;
  Login: undefined;
  SosJugador: undefined;
  Cuestionario: { cargaPara: CargaPara };
  Enrolamiento: undefined;
  Gracias: { nombre: string; tipo: 'jugador' | 'comunidad'; cargaPara: CargaPara };
};

export type ScreenProps<K extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, K>;
