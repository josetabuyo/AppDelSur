import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ColegioField, LocalidadField } from '../components/ColegioField';
import { Crest } from '../components/Crest';
import { ScrollViewRef, SectionLabel } from '../components/FormScaffold';
import { TextField } from '../components/TextField';
import { CargaPara, ComoConocio, emptyJugador, Errors, JugadorForm, validateJugador } from '../lib/forms';
import { DEPORTES } from '../lib/opciones';
import { cargaParaDe, identidadCompleta, prefillDePadron } from '../lib/padron';
import { buildJugadorPayload, splitName } from '../lib/payload';
import { maskDate, maskPhone } from '../lib/validation';
import type { ScreenProps } from '../navigation/types';
import { api, ApiError } from '../services/api';
import { clearBorrador, getBorrador, setBorrador } from '../services/storage';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

const IDENTIDAD: (keyof JugadorForm)[] = ['nombre', 'apellido', 'fechaNacimiento'];

const COMO_CONOCIO: { value: ComoConocio; label: string }[] = [
  { value: 'colegio', label: 'Colegio' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'parque', label: 'Parque Indoamericano' },
  { value: 'evento', label: 'Un evento' },
  { value: 'socio', label: 'Me lo recomendó un socio/a' },
  { value: 'otro', label: 'Otro' },
];

/** Las preguntas cambian de persona según quién completa: uno mismo, un hijo/a o un compañero/a. */
const TEXTOS = {
  yo: { juega: '¿Qué jugás?', colegio: '¿A qué colegio vas o fuiste?', barrio: '¿En qué barrio o localidad vivís?', whatsapp: 'Tu WhatsApp', conocio: '¿Cómo conociste Del Sur?', hermanos: '¿Tenés hermanos/as o hijos/as de 4 a 18 años que no jueguen en el club?' },
  hijo: { juega: '¿Qué juega?', colegio: '¿A qué colegio va?', barrio: '¿En qué barrio o localidad viven?', whatsapp: 'Tu WhatsApp', conocio: '¿Cómo conocieron Del Sur?', hermanos: '¿Tiene hermanos/as de 4 a 18 años que no jueguen en el club?' },
  companero: { juega: '¿Qué juega?', colegio: '¿A qué colegio va o fue?', barrio: '¿En qué barrio o localidad vive?', whatsapp: 'Su WhatsApp', conocio: '¿Cómo conoció Del Sur?', hermanos: '¿Tiene hermanos/as de 4 a 18 años que no jueguen en el club?' },
} as const;

/**
 * La ficha de un jugador, en una sola pantalla: los datos mínimos que pidió Joel (identidad, deporte,
 * colegio, barrio, WhatsApp, cómo conoció el club y hermanos que podrían sumarse). Si viene del padrón,
 * lo que el club ya sabe viene cargado. Se guarda en el teléfono mientras se tipea y se envía con "Listo".
 */
export default function FichaScreen({ navigation, route }: ScreenProps<'Ficha'>) {
  const { persona } = route.params;
  const insets = useSafeAreaInsets();
  const { user, token, padron, addRegistro, logout } = useSession();
  const cargaPara: CargaPara = persona ? cargaParaDe(persona, user?.name) : (route.params.cargaPara ?? 'yo');
  const hijo = cargaPara === 'hijo';
  const companero = cargaPara === 'companero';
  const t = TEXTOS[cargaPara];
  const borrador = persona?.socio ?? `nuevo-${cargaPara}`;
  const scrollRef = useRef<ScrollViewRef>(null);

  const [form, setForm] = useState<JugadorForm>(() => {
    const yo = splitName(user?.name);
    const email = companero ? '' : (user?.email ?? '');
    const adultoNombre = hijo ? (user?.name ?? '') : '';
    if (persona) return emptyJugador({ ...prefillDePadron(persona), email, adultoNombre });
    if (hijo) return emptyJugador({ apellido: yo.apellido, email, adultoNombre });
    return emptyJugador(companero ? {} : { ...yo, email });
  });
  const [editarIdentidad, setEditarIdentidad] = useState(() => !persona || !identidadCompleta(persona));
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const cargado = useRef(false);

  // Si quedó un borrador de antes (se cerró la app a mitad), sigue desde ahí.
  useEffect(() => {
    getBorrador<JugadorForm>(borrador).then((b) => {
      if (b) setForm((f) => ({ ...f, ...b }));
      cargado.current = true;
    });
  }, [borrador]);

  useEffect(() => {
    if (!cargado.current) return;
    setGuardado(false);
    const timer = setTimeout(() => setBorrador(borrador, form).then(() => setGuardado(true)), 600);
    return () => clearTimeout(timer);
  }, [form, borrador]);

  const set = <K extends keyof JugadorForm>(k: K, v: JugadorForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const mostrarErrores = (e: Errors) => {
    setErrors(e);
    if (IDENTIDAD.some((k) => e[k as string])) setEditarIdentidad(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const listo = async () => {
    const e = validateJugador(form);
    if (Object.keys(e).length) return mostrarErrores(e);
    if (!token) return;
    setBanner(null);
    setSending(true);
    try {
      const res = await api.crearRegistro(token, buildJugadorPayload(form, cargaPara, persona?.socio));
      addRegistro(res.registro);
      await clearBorrador(borrador);
      const quedan = !!persona && padron.some((p) => !p.cargado && p.socio !== persona.socio);
      if (quedan && navigation.canGoBack()) navigation.goBack();
      else navigation.replace('Gracias', { nombre: form.nombre.trim(), tipo: 'jugador', cargaPara });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        mostrarErrores(err.campos);
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

  const primerNombre = form.nombre.split(' ')[0];
  const titulo = persona
    ? hijo
      ? `Datos de ${primerNombre}`
      : `Hola ${primerNombre}`
    : hijo
      ? 'Datos de tu hijo/a'
      : companero
        ? 'Tu compañero/a'
        : 'Contanos de vos';

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <View style={styles.top}>
            {navigation.canGoBack() ? (
              <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Volver">
                <Text style={styles.back}>‹</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Crest size={36} />
          </View>

          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.sub}>{persona ? 'Completá lo que falta. Se guarda solo.' : 'Un minuto. Se guarda solo.'}</Text>

          {banner ? <Text style={styles.banner}>{banner}</Text> : null}

          {editarIdentidad ? (
            <>
              <TextField label="Nombre" value={form.nombre} onChangeText={(v) => set('nombre', v)} error={errors.nombre} autoCapitalize="words" />
              <TextField label="Apellido" value={form.apellido} onChangeText={(v) => set('apellido', v)} error={errors.apellido} autoCapitalize="words" />
              <TextField
                label="Fecha de nacimiento"
                optional
                value={form.fechaNacimiento}
                onChangeText={(v) => set('fechaNacimiento', maskDate(v))}
                error={errors.fechaNacimiento}
                keyboardType="number-pad"
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            </>
          ) : (
            <View style={styles.persona}>
              <View style={{ flex: 1 }}>
                <Text style={styles.personaName}>
                  {form.nombre} {form.apellido}
                </Text>
                <Text style={styles.personaData}>{[form.fechaNacimiento, form.division].filter(Boolean).join(' · ')}</Text>
              </View>
              <Text testID="editar-persona" accessibilityRole="button" style={styles.personaEdit} onPress={() => setEditarIdentidad(true)}>
                Editar
              </Text>
            </View>
          )}

          <SectionLabel>{t.juega}</SectionLabel>
          <View style={styles.chips}>
            {DEPORTES.map((d) => (
              <Chip key={d.value} label={d.label} emoji={d.emoji} selected={form.deporte === d.value} onPress={() => set('deporte', form.deporte === d.value ? null : d.value)} />
            ))}
          </View>

          <ColegioField label={t.colegio} value={form.colegio} onChange={(v) => set('colegio', v)} />
          <LocalidadField label={t.barrio} value={form.localidad} onChange={(v) => set('localidad', v)} />

          {hijo ? <TextField label="Tu nombre (mamá, papá o tutor/a)" value={form.adultoNombre} onChangeText={(v) => set('adultoNombre', v)} autoCapitalize="words" /> : null}
          <TextField label={t.whatsapp} optional value={form.telefono} onChangeText={(v) => set('telefono', maskPhone(v))} error={errors.telefono} keyboardType="phone-pad" placeholder="+54 9 11 5555-5555" />
          {companero ? (
            <TextField label="Su mail" optional value={form.email} onChangeText={(v) => set('email', v)} error={errors.email} keyboardType="email-address" autoCapitalize="none" placeholder="Para que también pueda entrar" />
          ) : null}

          <SectionLabel>{t.conocio}</SectionLabel>
          <View style={styles.chips}>
            {COMO_CONOCIO.map((c) => (
              <Chip key={c.value} small label={c.label} selected={form.comoConocio === c.value} onPress={() => set('comoConocio', form.comoConocio === c.value ? null : c.value)} />
            ))}
          </View>
          {form.comoConocio === 'socio' ? (
            <TextField label="¿Quién?" value={form.referidoPor} onChangeText={(v) => set('referidoPor', v)} placeholder="Nombre y apellido" autoCapitalize="words" />
          ) : null}
          {form.comoConocio === 'otro' ? (
            <TextField label="¿Cómo?" value={form.comoConocioDetalle} onChangeText={(v) => set('comoConocioDetalle', v)} placeholder="Contanos cómo llegaste al club" multiline />
          ) : null}

          <SectionLabel>{t.hermanos}</SectionLabel>
          <View style={styles.chips}>
            <Chip label="Sí" selected={form.hermanos === true} onPress={() => set('hermanos', form.hermanos === true ? null : true)} />
            <Chip label="No" selected={form.hermanos === false} onPress={() => set('hermanos', form.hermanos === false ? null : false)} />
          </View>
          {form.hermanos ? (
            <TextField label="¿Qué edad tienen y qué deporte les interesa?" value={form.hermanosDetalle} onChangeText={(v) => set('hermanosDetalle', v)} placeholder="Ej: Sofi, 9, hockey" />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text testID="guardado" style={styles.saved}>
          {guardado ? '✓ Guardado en el teléfono' : ' '}
        </Text>
        <Button testID="listo" label="Listo" onPress={listo} loading={sending} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { paddingHorizontal: 22, paddingBottom: 40, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 520 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { fontSize: 34, lineHeight: 36, color: colors.navy, paddingRight: 12 },
  title: { ...display(36), color: colors.navy },
  sub: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: 22 },
  banner: { fontFamily: fonts.semibold, color: colors.error, fontSize: 14, backgroundColor: '#FDECEE', borderRadius: radius.md, padding: 14, marginBottom: 16, overflow: 'hidden' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  persona: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.celesteSoft, borderRadius: radius.md, padding: 14, marginBottom: 22 },
  personaName: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
  personaData: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  personaEdit: { fontFamily: fonts.bold, fontSize: 14, color: colors.celeste, padding: 6 },
  footer: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E4EAF1', gap: 6 },
  saved: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.success, textAlign: 'center' },
});
