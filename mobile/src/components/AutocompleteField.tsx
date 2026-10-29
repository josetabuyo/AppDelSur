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
  hint?: string;
  placeholder?: string;
  optional?: boolean;
  highlight?: boolean;
  testID?: string;
};

/**
 * Campo que sugiere de una lista mientras se tipea (también al corregir algo ya cargado). Al elegir queda
 * escrito siempre igual, para poder contar y cruzar; "Otro" deja lo tipeado tal cual, si no está en la lista.
 */
export function AutocompleteField({ label, value, onChange, buscar, hint, placeholder, optional, highlight, testID }: Props) {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  // Lo último tipeado acá. Si el valor es otro (se eligió de la lista, se confirmó con "Otro" o vino
  // precargado), está fijo, con "Cambiar" para corregirlo.
  const tipeado = useRef<string | null>(null);
  const [, refrescar] = useState(0);
  const fijo = !!value && value !== tipeado.current;
  const buscando = !fijo && value.trim().length >= 2;

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

  const fijar = (v: string) => {
    tipeado.current = null;
    if (v === value) refrescar((n) => n + 1);
    else onChange(v);
  };

  const lista = buscando ? (
    <View style={styles.lista}>
      {opciones.map((o) => (
        <Pressable key={o.key} onPress={() => fijar(o.detalle ? `${o.titulo} (${o.detalle})` : o.titulo)} style={({ pressed }) => [styles.item, pressed && styles.pressed]} accessibilityRole="button">
          <Text style={styles.titulo}>{o.titulo}</Text>
          {o.detalle ? <Text style={styles.detalle}>{o.detalle}</Text> : null}
        </Pressable>
      ))}
      <Pressable testID={testID ? `${testID}-otro` : undefined} onPress={() => fijar(value.trim())} style={({ pressed }) => [styles.item, styles.otro, pressed && styles.pressed]} accessibilityRole="button">
        <Text style={styles.titulo}>Otro: «{value.trim()}»</Text>
        <Text style={styles.detalle}>No está en la lista: dejarlo como lo escribí</Text>
      </Pressable>
    </View>
  ) : fijo ? (
    <Text
      style={styles.link}
      accessibilityRole="button"
      onPress={() => {
        tipeado.current = value;
        refrescar((n) => n + 1);
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
      hint={hint}
      value={value}
      onChangeText={(v) => {
        tipeado.current = v;
        onChange(v);
      }}
      editable={!fijo}
      placeholder={placeholder}
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
