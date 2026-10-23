import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { FormHeader } from '../components/FormHeader';
import { FormScaffold, ScrollViewRef, SectionLabel } from '../components/FormScaffold';
import { StepProgress } from '../components/StepProgress';
import { TextField } from '../components/TextField';
import { Deporte, emptyJugador, Errors, firstStepWithError, JugadorForm, validateJugador } from '../lib/forms';
import { buildJugadorPayload, splitName } from '../lib/payload';
import { maskDate } from '../lib/validation';
import type { ScreenProps } from '../navigation/types';
import { api, ApiError } from '../services/api';
import { useSession } from '../state/session';
import { colors, fonts, radius } from '../theme';

const DEPORTES: { value: Deporte; label: string; emoji: string }[] = [
  { value: 'rugby', label: 'Rugby', emoji: '🏉' },
  { value: 'hockey', label: 'Hockey', emoji: '🏑' },
  { value: 'rugby_inclusivo', label: 'Rugby inclusivo', emoji: '🤝' },
];

const DIVISIONES: Record<Deporte, string[]> = {
  rugby: ['M6', 'M8', 'M10', 'M12', 'M14', 'M15', 'M16', 'M17', 'M19', 'Plantel superior'],
  hockey: ['Infantiles', 'Menores', 'Juveniles', 'Intermedia', 'Primera', 'Mamis'],
  rugby_inclusivo: ['Pumpas XV'],
};

const CARITAS = ['😞', '🙁', '😐', '🙂', '😍'];
const STEP_LABELS = ['Persona', 'Club', 'Contacto y charla'];

export default function CuestionarioScreen({ navigation, route }: ScreenProps<'Cuestionario'>) {
  const { cargaPara } = route.params;
  const hijo = cargaPara === 'hijo';
  const { user, token, addRegistro, logout } = useSession();
  const scrollRef = useRef<ScrollViewRef>(null);

  const [form, setForm] = useState<JugadorForm>(() => {
    const n = splitName(user?.name);
    return emptyJugador(hijo ? { apellido: n.apellido, email: user?.email ?? '' } : { ...n, email: user?.email ?? '' });
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const set = <K extends keyof JugadorForm>(k: K, v: JugadorForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const t = useMemo(
    () =>
      hijo
        ? {
            titles: ['Contanos de tu hijo/a', 'Su club', 'Contacto y charla'],
            subtitle: 'Cargás los datos de un chico o chica que juega en Del Sur.',
            nombre: 'Nombre del chico/a',
            fecha: '¿Cuándo nació?',
            colegio: '¿A qué colegio va?',
            localidad: '¿En qué localidad viven?',
            domicilio: 'Domicilio',
            telefono: 'Tu teléfono (mamá, papá o tutor/a)',
            email: 'Tu mail',
            familia: '¿Tiene hermanos u otros familiares en el club?',
            contento: '¿Está contento/a en el club?',
          }
        : {
            titles: ['Contanos de vos', 'Tu club', 'Contacto y charla'],
            subtitle: 'Solo nombre y apellido son obligatorios. Lo demás nos ayuda un montón.',
            nombre: 'Nombre',
            fecha: 'Fecha de nacimiento',
            colegio: '¿A qué colegio vas o fuiste?',
            localidad: '¿En qué localidad vivís?',
            domicilio: 'Domicilio',
            telefono: 'Teléfono',
            email: 'Mail',
            familia: '¿Tenés familia en el club? (hijos, hermanos, padres)',
            contento: '¿Estás contento/a en el club?',
          },
    [hijo],
  );

  const goStep = (s: number) => {
    setStep(s);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const next = () => {
    const e = validateJugador(form, step);
    setErrors(e);
    if (Object.keys(e).length) return;
    goStep(step + 1);
  };

  const back = () => (step === 0 ? navigation.goBack() : goStep(step - 1));

  // "Atrás" del sistema (Android o navegador) vuelve un paso del cuestionario, no a la pantalla anterior.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (step === 0 || e.data.action.type !== 'GO_BACK') return;
        e.preventDefault();
        goStep(step - 1);
      }),
    [navigation, step],
  );

  const submit = async () => {
    const e = validateJugador(form);
    if (Object.keys(e).length) {
      setErrors(e);
      goStep(Math.max(0, firstStepWithError(e)));
      return;
    }
    if (!token) return;
    setBanner(null);
    setSending(true);
    try {
      const res = await api.crearRegistro(token, buildJugadorPayload(form, cargaPara));
      addRegistro(res.registro);
      navigation.replace('Gracias', { nombre: form.nombre.trim(), tipo: 'jugador', cargaPara });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const campos = err.campos;
        setErrors(campos);
        setBanner('Revisá los datos marcados.');
        goStep(Math.max(0, firstStepWithError(campos)));
      } else if (err instanceof ApiError && err.status === 401) {
        await logout();
      } else {
        setBanner((err as Error).message || 'Algo falló. Probá de nuevo.');
      }
    } finally {
      setSending(false);
    }
  };

  const last = step === 2;

  return (
    <FormScaffold
      ref={scrollRef}
      banner={banner}
      header={
        <FormHeader title={t.titles[step]} subtitle={step === 0 ? t.subtitle : undefined} onBack={back}>
          <StepProgress step={step} total={3} labels={STEP_LABELS} />
        </FormHeader>
      }
      footer={
        <>
          {step > 0 ? <Button label="Atrás" variant="outline" onPress={back} style={{ flex: 0.6 }} /> : null}
          <Button
            testID={last ? 'enviar' : 'seguir'}
            label={last ? 'Enviar' : 'Seguir'}
            variant={last ? 'primary' : 'navy'}
            onPress={last ? submit : next}
            loading={sending}
            style={{ flex: 1 }}
          />
        </>
      }
    >
      {step === 0 && (
        <>
          <TextField label={t.nombre} value={form.nombre} onChangeText={(v) => set('nombre', v)} error={errors.nombre} autoCapitalize="words" textContentType="givenName" />
          <TextField label="Apellido" value={form.apellido} onChangeText={(v) => set('apellido', v)} error={errors.apellido} autoCapitalize="words" textContentType="familyName" />
          <TextField label="DNI" optional value={form.dni} onChangeText={(v) => set('dni', v.replace(/[^\d.]/g, ''))} error={errors.dni} keyboardType="number-pad" placeholder="Ej: 45123456" maxLength={10} />
          <TextField
            label={t.fecha}
            optional
            value={form.fechaNacimiento}
            onChangeText={(v) => set('fechaNacimiento', maskDate(v))}
            error={errors.fechaNacimiento}
            keyboardType="number-pad"
            placeholder="DD/MM/AAAA"
            maxLength={10}
          />
        </>
      )}

      {step === 1 && (
        <>
          <SectionLabel>{hijo ? '¿Qué juega?' : '¿Qué jugás?'}</SectionLabel>
          <View style={styles.chips}>
            {DEPORTES.map((d) => (
              <Chip key={d.value} label={d.label} emoji={d.emoji} selected={form.deporte === d.value} onPress={() => set('deporte', form.deporte === d.value ? null : d.value)} />
            ))}
          </View>
          <TextField label="División / categoría" optional value={form.division} onChangeText={(v) => set('division', v)} placeholder="Ej: M10, Plantel superior, Pumpas XV" />
          {form.deporte ? (
            <View style={[styles.chips, { marginTop: -8, marginBottom: 20 }]}>
              {DIVISIONES[form.deporte].map((d) => (
                <Chip key={d} small label={d} selected={form.division === d} onPress={() => set('division', d)} />
              ))}
            </View>
          ) : null}
          <TextField
            highlight
            label={t.colegio}
            hint="Nos ayuda a saber en qué escuelas estamos, para llegar a más chicos."
            value={form.colegio}
            onChangeText={(v) => set('colegio', v)}
            placeholder="Nombre del colegio"
            autoCapitalize="words"
          />
          <TextField label={t.localidad} optional value={form.localidad} onChangeText={(v) => set('localidad', v)} placeholder="Ej: 9 de Abril, Ciudad Evita, Lugano" autoCapitalize="words" />
          <TextField label={t.domicilio} optional value={form.domicilio} onChangeText={(v) => set('domicilio', v)} placeholder="Calle y número" />
        </>
      )}

      {step === 2 && (
        <>
          <TextField label={t.telefono} optional value={form.telefono} onChangeText={(v) => set('telefono', v)} error={errors.telefono} keyboardType="phone-pad" placeholder="Ej: 11 5555 5555" textContentType="telephoneNumber" />
          <TextField label={t.familia} optional value={form.familiaEnClub} onChangeText={(v) => set('familiaEnClub', v)} placeholder="Ej: hermano Tomás en M12" />

          <SectionLabel>{t.contento}</SectionLabel>
          <View style={styles.faces}>
            {CARITAS.map((c, i) => {
              const val = i + 1;
              const on = form.contento === val;
              return (
                <Text
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={`${val} de 5`}
                  onPress={() => set('contento', on ? null : val)}
                  style={[styles.face, on && styles.faceOn, form.contento !== null && !on && { opacity: 0.4 }]}
                >
                  {c}
                </Text>
              );
            })}
          </View>

          <SectionLabel>¿Conocés a alguien que dejó de venir?</SectionLabel>
          <View style={[styles.chips, { marginBottom: 16 }]}>
            <Chip label="Sí" selected={form.conoceQuienDejo === true} onPress={() => set('conoceQuienDejo', form.conoceQuienDejo === true ? null : true)} />
            <Chip label="No" selected={form.conoceQuienDejo === false} onPress={() => set('conoceQuienDejo', form.conoceQuienDejo === false ? null : false)} />
          </View>
          {form.conoceQuienDejo ? (
            <TextField
              label="¿Quién y por qué?"
              hint="Nos sirve para llamarlos y ver qué podemos mejorar."
              value={form.quienDejoDetalle}
              onChangeText={(v) => set('quienDejoDetalle', v)}
              multiline
              style={{ minHeight: 90, paddingTop: 12, textAlignVertical: 'top' }}
            />
          ) : null}
        </>
      )}
    </FormScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  faces: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 22,
  },
  face: { fontSize: 34, padding: 6, borderRadius: 14, overflow: 'hidden', fontFamily: fonts.body },
  faceOn: { backgroundColor: colors.yellowSoft, transform: [{ scale: 1.12 }] },
});

