import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  highlight?: boolean; // dato clave (colegio)
};

export function TextField({ label, hint, error, optional, highlight, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrap, highlight && styles.highlightWrap]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? <Text style={styles.optional}>opcional</Text> : null}
        {highlight ? <Text style={styles.key}>★ DATO CLAVE</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        placeholderTextColor="#9AA8B8"
        accessibilityLabel={label}
        style={[styles.input, focused && styles.focused, !!error && styles.inputError, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  highlightWrap: {
    backgroundColor: colors.yellowSoft,
    borderRadius: radius.md,
    padding: 14,
    marginHorizontal: -6,
    borderWidth: 1.5,
    borderColor: colors.yellow,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  optional: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  key: { fontFamily: fonts.black, fontSize: 11, color: colors.navy, letterSpacing: 0.6, marginLeft: 'auto' },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: 8, lineHeight: 18 },
  input: {
    minHeight: 52,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
  },
  focused: { borderColor: colors.celeste, backgroundColor: '#FBFEFF' },
  inputError: { borderColor: colors.error },
  error: { fontFamily: fonts.medium, color: colors.error, fontSize: 13, marginTop: 6 },
});
