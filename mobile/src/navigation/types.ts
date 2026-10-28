import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CargaPara } from '../lib/forms';
import type { PadronPersona } from '../services/api';

export type RootStackParamList = {
  Inicio: undefined;
  Padron: undefined;
  Bienvenida: undefined;
  Login: undefined;
  SosJugador: undefined;
  Cuestionario: { cargaPara: CargaPara; persona?: PadronPersona };
  Enrolamiento: undefined;
  Gracias: { nombre: string; tipo: 'jugador' | 'comunidad'; cargaPara: CargaPara };
};

export type ScreenProps<K extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, K>;
