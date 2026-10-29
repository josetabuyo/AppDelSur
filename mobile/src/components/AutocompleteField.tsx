import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { TextField } from './TextField';

export type Opcion = { key: string; titulo: string; detalle: string };

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Busca opciones para lo tipeado (ya con debounce). */
  buscar: (q: string) => Promise<Opcion[]>;
  /** Qué hacer al elegir una opción (por defecto: "Título (detalle)"). */
  elegir?: (o: Opcion) => void | Promise<void>;
  hint?: string;
  hintOtro?: string;
  placeholder?: string;
  placeholderOtro?: string;
  optional?: boolean;
  highlight?: boolean;
  testID?: string;
};

/**
 * Campo que sugiere de una lista mientras se tipea. Al elegir queda escrito siempre igual (se puede
 * contar y cruzar); "Otro" deja escribir algo que no está en la lista.
 */
export function AutocompleteField({ label, value, onChange, buscar, elegir, hint, hintOtro, placeholder, placeholderOtro, optional, highlight, testID }: Props) {
  const [otro, setOtro] = useState(false);
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  // Lo último tipeado acá. Si el valor es otro (se eligió de la lista, vino precargado o lo completó
  // otro campo, como el domicilio a la localidad), está "elegido": fijo, con "Cambiar".
  const tipeado = useRef<string | null>(null);
  const elegido = !!value && value !== tipeado.current && !otro;
  const buscando = !otro && !elegido && value.trim().length >= 2;

  useEffect(() => {
    if (!buscando) return setOpciones([]);
    let vigente = true;
    const t = setTimeout(() => {
      buscar(value)
        .then((r) => vigente && setOpciones(r))
        .catch(() => vigente && setOpciones([]));
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
    // buscar cambia en cada render del padre; lo que importa es lo tipeado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, buscando]);

  const tocar = async (o: Opcion) => {
    if (elegir) await elegir(o);
    else onChange(o.detalle ? `${o.titulo} (${o.detalle})` : o.titulo);
  };

  const lista = buscando ? (
    <View style={styles.lista}>
      {opciones.map((o) => (
        <Pressable key={o.key} onPress={() => tocar(o)} style={({ pressed }) => [styles.item, pressed && styles.pressed]} accessibilityRole="button">
          <Text style={styles.titulo}>{o.titulo}</Text>
          {o.detalle ? <Text style={styles.detalle}>{o.detalle}</Text> : null}
        </Pressable>
      ))}
      <Pressable testID={testID ? `${testID}-otro` : undefined} onPress={() => setOtro(true)} style={({ pressed }) => [styles.item, styles.otro, pressed && styles.pressed]} accessibilityRole="button">
        <Text style={styles.titulo}>Otro</Text>
        <Text style={styles.detalle}>No está en la lista: lo escribo yo</Text>
      </Pressable>
    </View>
  ) : elegido || otro ? (
    <Text
      style={styles.link}
      accessibilityRole="button"
      onPress={() => {
        setOtro(false);
        tipeado.current = '';
        onChange('');
      }}
    >
      Cambiar
    </Text>
  ) : null;

  return (
    <TextField
      highlight={highlight}
      optional={optional}
      label={label}
      hint={otro ? hintOtro : hint}
      value={value}
      onChangeText={(v) => {
        tipeado.current = v;
        onChange(v);
      }}
      editable={!elegido}
      placeholder={otro ? placeholderOtro : placeholder}
      autoCapitalize="words"
      below={lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: { marginTop: 6, backgroundColor: colors.white, borderRadius: radius.sm + 2, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  item: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  otro: { borderBottomWidth: 0, backgroundColor: colors.paper },
  pressed: { backgroundColor: colors.celesteSoft },
  titulo: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  detalle: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  link: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.celeste, marginTop: 8, alignSelf: 'flex-end' },
});
