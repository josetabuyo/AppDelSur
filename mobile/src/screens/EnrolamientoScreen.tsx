import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { FormHeader } from '../components/FormHeader';
import { FormScaffold, SectionLabel } from '../components/FormScaffold';
import { TextField } from '../components/TextField';
import { ComunidadForm, emptyComunidad, Errors, validateComunidad, Vinculo } from '../lib/forms';
import { buildComunidadPayload, splitName } from '../lib/payload';
import { maskPhone } from '../lib/validation';
import type { ScreenProps } from '../navigation/types';
import { api, ApiError } from '../services/api';
import { useSession } from '../state/session';

const VINCULOS: { value: Vinculo; label: string; detalle: string }[] = [
  { value: 'familiar', label: 'Familiar de un jugador/a', detalle: 'Ej: mamá de Juan, M10' },
  { value: 'socio', label: 'Socio/a', detalle: 'Desde cuándo, si te acordás' },
  { value: 'ex_jugador', label: 'Ex jugador/a', detalle: 'Ej: jugué en el plantel hasta 2018' },
  { value: 'amigo', label: 'Amigo/a del club', detalle: 'Contanos cómo llegaste' },
  { value: 'otro', label: 'Otro', detalle: 'Contanos' },
];

export default function EnrolamientoScreen({ navigation }: ScreenProps<'Enrolamiento'>) {
  const { user, token, addRegistro, logout } = useSession();
  const [form, setForm] = useState<ComunidadForm>(() => emptyComunidad({ ...splitName(user?.name), email: user?.email ?? '' }));
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const set = <K extends keyof ComunidadForm>(k: K, v: ComunidadForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async () => {
    const e = validateComunidad(form);
    setErrors(e);
    if (Object.keys(e).length || !token) return;
    setBanner(null);
    setSending(true);
    try {
      const res = await api.crearRegistro(token, buildComunidadPayload(form));
      addRegistro(res.registro);
      navigation.replace('Gracias', { nombre: form.nombre.trim(), tipo: 'comunidad', cargaPara: 'yo' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setErrors(err.campos);
        setBanner('Revisá los datos marcados.');
      } else if (err instanceof ApiError && err.status === 401) {
        await logout();
      } else {
        setBanner((err as Error).message || 'Algo falló. Probá de nuevo.');
      }
    } finally {
      setSending(false);
    }
  };

  const vinculo = VINCULOS.find((v) => v.value === form.vinculo);

  return (
    <FormScaffold
      banner={banner}
      header={<FormHeader title="Sumate a la comunidad" subtitle="Del Sur también son las familias, los socios y los amigos. Contanos quién sos." onBack={() => navigation.goBack()} />}
      footer={<Button testID="enviar" label="Sumarme" onPress={submit} loading={sending} style={{ flex: 1 }} />}
    >
      <TextField label="Nombre" value={form.nombre} onChangeText={(v) => set('nombre', v)} error={errors.nombre} autoCapitalize="words" />
      <TextField label="Apellido" value={form.apellido} onChangeText={(v) => set('apellido', v)} error={errors.apellido} autoCapitalize="words" />
      <SectionLabel>¿Cuál es tu vínculo con el club?</SectionLabel>
      <View style={styles.chips}>
        {VINCULOS.map((v) => (
          <Chip key={v.value} label={v.label} selected={form.vinculo === v.value} onPress={() => set('vinculo', form.vinculo === v.value ? null : v.value)} />
        ))}
      </View>
      {vinculo ? <TextField label="Contanos un poco más" optional value={form.vinculoDetalle} onChangeText={(v) => set('vinculoDetalle', v)} placeholder={vinculo.detalle} /> : null}
      <TextField label="Teléfono" optional value={form.telefono} onChangeText={(v) => set('telefono', maskPhone(v))} error={errors.telefono} keyboardType="phone-pad" placeholder="+54 9 11 5555-5555" />
    </FormScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
});
