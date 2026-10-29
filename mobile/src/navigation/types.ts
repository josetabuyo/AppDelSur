import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CargaPara } from '../lib/forms';
import type { PadronPersona } from '../services/api';

export type RootStackParamList = {
  Inicio: undefined;
  Padron: undefined;
  /** Del padrón (persona) o cargando a alguien nuevo (cargaPara). */
  Ficha: { persona?: PadronPersona; cargaPara?: CargaPara };
  Bienvenida: undefined;
  SosJugador: undefined;
  Enrolamiento: undefined;
  Gracias: { nombre: string; tipo: 'jugador' | 'comunidad'; cargaPara: CargaPara };
};

export type ScreenProps<K extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, K>;
