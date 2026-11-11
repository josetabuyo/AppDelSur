import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CargaPara } from '../lib/forms';
import type { PadronPersona, Registro } from '../services/api';

export type RootStackParamList = {
  Inicio: undefined;
  Padron: undefined;
  /** Del padrón (persona), corrigiendo una ficha ya enviada (registro) o cargando a alguien nuevo (cargaPara). */
  /** `volver`: al guardar vuelve a la pantalla anterior (se abrió con "Agregar otro jugador"). */
  Ficha: { persona?: PadronPersona; registro?: Registro; cargaPara?: CargaPara; volver?: boolean };
  Bienvenida: undefined;
  Enrolamiento: undefined;
  Gracias: { nombre: string; tipo: 'jugador' | 'comunidad'; cargaPara: CargaPara };
};

export type ScreenProps<K extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, K>;
