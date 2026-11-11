import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CargaPara } from '../lib/forms';
import type { PadronPersona, Registro } from '../services/api';

export type RootStackParamList = {
  Inicio: undefined;
  Padron: undefined;
  /** La ficha de entrada de un mail con un solo jugador. Ruta aparte: sus params no se heredan a las fichas que se abren después. */
  FichaPropia: { persona: PadronPersona };
  /** Del padrón (persona), corrigiendo una ficha ya enviada (registro) o cargando a alguien nuevo (cargaPara). */
  /** `volver`: al guardar vuelve a la pantalla anterior (se abrió con "Agregar otro jugador"). */
  Ficha: { persona?: PadronPersona; registro?: Registro; cargaPara?: CargaPara; volver?: boolean };
  /** `gracias`: viene de guardar una ficha (nombre de quien se guardó). */
  Bienvenida: { gracias?: string } | undefined;
  Enrolamiento: undefined;
  Gracias: { nombre: string; tipo: 'jugador' | 'comunidad'; cargaPara: CargaPara };
};

export type ScreenProps<K extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, K>;
