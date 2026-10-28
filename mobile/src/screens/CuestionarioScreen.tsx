import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { FormHeader } from '../components/FormHeader';
import { FormScaffold, ScrollViewRef, SectionLabel } from '../components/FormScaffold';
import { StepProgress } from '../components/StepProgress';
import { TextField } from '../components/TextField';
import { Deporte, emptyJugador, Errors, firstStepWithError, JugadorForm, validateJugador } from '../lib/forms';
import { identidadCompleta, prefillDePadron } from '../lib/padron';
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

// Los nombres que usa el padrón del club ("Rugby > M-16", "Hockey > 6ta (2do Año)").
const DIVISIONES: Record<Deporte, string[]> = {
  rugby: ['Escuelita', 'M-9', 'M-10', 'M-11', 'M-12', 'M-13', 'M-14', 'M-15', 'M-16', 'M-17', 'M-18', 'M-19', 'Plantel Superior'],
  hockey: ['Escuelita', '10ma', '9na', '8va', '7ma', '6ta', '5ta', 'Plantel Superior', 'Mamis'],
  rugby_inclusivo: ['Infantiles', 'Adultos'],
};

const CARITAS = ['😞', '🙁', '😐', '🙂', '😍'];
const STEP_LABELS = ['Persona', 'Club', 'Contacto y charla'];

export default function CuestionarioScreen({ navigation, route }: ScreenProps<'Cuestionario'>) {
  const { cargaPara, persona } = route.params;
  const hijo = cargaPara === 'hijo';
  const companero = cargaPara === 'companero';
  const { user, token, addRegistro, logout } = useSession();
  const scrollRef = useRef<ScrollViewRef>(null);

  const [form, setForm] = useState<JugadorForm>(() => {
    const email = user?.email ?? '';
    if (persona) return emptyJugador({ ...prefillDePadron(persona), email: companero ? '' : email });
    if (companero) return emptyJugador();
    const n = splitName(user?.name);
    return emptyJugador(hijo ? { apellido: n.apellido, email } : { ...n, email });
  });
  // Si el padrón ya trae nombre, DNI y fecha, arrancamos en "Club": un paso menos.
  const [saltarPersona, setSaltarPersona] = useState(() => !!persona && identidadCompleta(persona));
  const pasos = saltarPersona ? [1, 2] : [0, 1, 2];
  const [step, setStep] = useState(pasos[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const set = <K extends keyof JugadorForm>(k: K, v: JugadorForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const t = useMemo(
    () =>
      companero
        ? {
            titles: ['Tu compañero/a', 'Su club', 'Contacto'],
            subtitle: 'Cargás los datos de alguien del club que no tiene la app. Con nombre y apellido alcanza.',
            nombre: 'Nombre',
            fecha: 'Fecha de nacimiento',
            colegio: '¿A qué colegio va o fue?',
            localidad: '¿En qué localidad vive?',
            domicilio: 'Domicilio',
            telefono: 'Su teléfono',
            email: 'Su mail',
            familia: '¿Tiene familia en el club?',
            contento: '',
          }
        : hijo
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
            subtitle: 'Solo nombre y apellido son obligatorios. Lo demás nos sirve para darte un mejor club.',
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
    [hijo, companero],
  );

  const goStep = (s: number) => {
    setStep(s);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const next = () => {
    const e = validateJugador(form, step);
    setErrors(e);
    if (Object.keys(e).length) return;
    goStep(pasos[pasos.indexOf(step) + 1]);
  };

  const back = () => (step === pasos[0] ? navigation.goBack() : goStep(pasos[pasos.indexOf(step) - 1]));

  // "Atrás" del sistema (Android o navegador) vuelve un paso del cuestionario, no a la pantalla anterior.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (step === pasos[0] || e.data.action.type !== 'GO_BACK') return;
        e.preventDefault();
        goStep(pasos[pasos.indexOf(step) - 1]);
      }),
    [navigation, step, saltarPersona],
  );

  const submit = async () => {
    const e = validateJugador(form);
    if (Object.keys(e).length) {
      setErrors(e);
      const s0 = Math.max(0, firstStepWithError(e));
      if (s0 === 0) setSaltarPersona(false);
      goStep(s0);
      return;
    }
    if (!token) return;
    setBanner(null);
    setSending(true);
    try {
      const res = await api.crearRegistro(token, buildJugadorPayload(form, cargaPara, persona?.socio));
      addRegistro(res.registro);
      navigation.replace('Gracias', { nombre: form.nombre.trim(), tipo: 'jugador', cargaPara });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const campos = err.campos;
        setErrors(campos);
        setBanner('Revisá los datos marcados.');
        const s0 = Math.max(0, firstStepWithError(campos));
        if (s0 === 0) setSaltarPersona(false);
        goStep(s0);
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
        <FormHeader title={t.titles[step]} subtitle={step === pasos[0] && !persona ? t.subtitle : undefined} onBack={back}>
          <StepProgress step={pasos.indexOf(step)} total={pasos.length} labels={pasos.map((p) => STEP_LABELS[p])} />
        </FormHeader>
      }
      footer={
        <>
          {step > pasos[0] ? <Button label="Atrás" variant="outline" onPress={back} style={{ flex: 0.6 }} /> : null}
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
          {saltarPersona ? (
            <View style={styles.persona}>
              <View style={{ flex: 1 }}>
                <Text style={styles.personaName}>
                  {form.nombre} {form.apellido}
                </Text>
                <Text style={styles.personaData}>
                  DNI {form.dni} · {form.fechaNacimiento}
                </Text>
              </View>
              <Text
                testID="editar-persona"
                accessibilityRole="button"
                style={styles.personaEdit}
                onPress={() => {
                  setSaltarPersona(false);
                  goStep(0);
                }}
              >
                Editar
              </Text>
            </View>
          ) : null}
          <SectionLabel>{hijo || companero ? '¿Qué juega?' : '¿Qué jugás?'}</SectionLabel>
          <View style={styles.chips}>
            {DEPORTES.map((d) => (
              <Chip key={d.value} label={d.label} emoji={d.emoji} selected={form.deporte === d.value} onPress={() => set('deporte', form.deporte === d.value ? null : d.value)} />
            ))}
          </View>
          <TextField label="División / categoría" optional value={form.division} onChangeText={(v) => set('division', v)} placeholder="Ej: M10, Plantel superior, Inclusivo" />
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
            hint="Así llevamos el club a más escuelas."
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
          {companero ? (
            <TextField label={t.email} optional value={form.email} onChangeText={(v) => set('email', v)} error={errors.email} keyboardType="email-address" autoCapitalize="none" placeholder="Para que también pueda entrar" />
          ) : null}
          <TextField label={t.familia} optional value={form.familiaEnClub} onChangeText={(v) => set('familiaEnClub', v)} placeholder="Ej: hermano Tomás en M12" />

          {companero ? null : (
            <>
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
  persona: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.celesteSoft,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 20,
  },
  personaName: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
  personaData: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  personaEdit: { fontFamily: fonts.bold, fontSize: 14, color: colors.celeste, padding: 6 },
  faceOn: { backgroundColor: colors.yellowSoft, transform: [{ scale: 1.12 }] },
});

