import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ColegioField, LocalidadField } from '../components/ColegioField';
import { DomicilioField } from '../components/DomicilioField';
import { Crest } from '../components/Crest';
import { ScrollViewRef, SectionLabel } from '../components/FormScaffold';
import { TextField } from '../components/TextField';
import { emptyJugador, Errors, JugadorForm, validateJugador } from '../lib/forms';
import { CARITAS, DEPORTES, DIVISIONES } from '../lib/opciones';
import { cargaParaDe, identidadCompleta, prefillDePadron } from '../lib/padron';
import { buildJugadorPayload } from '../lib/payload';
import { maskDate, maskPhone } from '../lib/validation';
import type { ScreenProps } from '../navigation/types';
import { api, ApiError } from '../services/api';
import { clearBorrador, getBorrador, setBorrador } from '../services/storage';
import { useSession } from '../state/session';
import { colors, display, fonts, radius } from '../theme';

const IDENTIDAD: (keyof JugadorForm)[] = ['nombre', 'apellido', 'dni', 'fechaNacimiento'];

/**
 * La ficha de un socio del padrón, en una sola pantalla: lo que el club ya sabe viene cargado, el resto
 * se completa scrolleando. Se guarda en el teléfono mientras se tipea y se envía entera con "Listo".
 */
export default function FichaScreen({ navigation, route }: ScreenProps<'Ficha'>) {
  const { persona } = route.params;
  const insets = useSafeAreaInsets();
  const { user, token, padron, addRegistro, logout } = useSession();
  const hijo = cargaParaDe(persona, user?.name) === 'hijo';
  const scrollRef = useRef<ScrollViewRef>(null);

  const [form, setForm] = useState<JugadorForm>(() => emptyJugador({ ...prefillDePadron(persona), email: user?.email ?? '' }));
  const [editarIdentidad, setEditarIdentidad] = useState(() => !identidadCompleta(persona));
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const cargado = useRef(false);

  // Si quedó un borrador de antes (se cerró la app a mitad), sigue desde ahí.
  useEffect(() => {
    getBorrador<JugadorForm>(persona.socio).then((b) => {
      if (b) setForm((f) => ({ ...f, ...b }));
      cargado.current = true;
    });
  }, [persona.socio]);

  useEffect(() => {
    if (!cargado.current) return;
    setGuardado(false);
    const t = setTimeout(() => setBorrador(persona.socio, form).then(() => setGuardado(true)), 600);
    return () => clearTimeout(t);
  }, [form, persona.socio]);

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
      const res = await api.crearRegistro(token, buildJugadorPayload(form, hijo ? 'hijo' : 'yo', persona.socio));
      addRegistro(res.registro);
      await clearBorrador(persona.socio);
      const quedan = padron.some((p) => !p.cargado && p.socio !== persona.socio);
      if (quedan && navigation.canGoBack()) navigation.goBack();
      else navigation.replace('Gracias', { nombre: form.nombre.trim(), tipo: 'jugador', cargaPara: hijo ? 'hijo' : 'yo' });
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

  const su = (vos: string, el: string) => (hijo ? el : vos);
  const divisiones = form.deporte ? DIVISIONES[form.deporte] : [];

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

          <Text style={styles.title}>{hijo ? `Datos de ${form.nombre.split(' ')[0]}` : `Hola ${form.nombre.split(' ')[0]}`}</Text>
          <Text style={styles.sub}>Completá lo que falta. Se guarda solo.</Text>

          {banner ? <Text style={styles.banner}>{banner}</Text> : null}

          {editarIdentidad ? (
            <>
              <TextField label="Nombre" value={form.nombre} onChangeText={(v) => set('nombre', v)} error={errors.nombre} autoCapitalize="words" />
              <TextField label="Apellido" value={form.apellido} onChangeText={(v) => set('apellido', v)} error={errors.apellido} autoCapitalize="words" />
              <TextField label="DNI" optional value={form.dni} onChangeText={(v) => set('dni', v.replace(/[^\d.]/g, ''))} error={errors.dni} keyboardType="number-pad" maxLength={10} />
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
                <Text style={styles.personaData}>
                  DNI {form.dni} · {form.fechaNacimiento}
                </Text>
              </View>
              <Text testID="editar-persona" accessibilityRole="button" style={styles.personaEdit} onPress={() => setEditarIdentidad(true)}>
                Editar
              </Text>
            </View>
          )}

          <SectionLabel>{su('¿Qué jugás?', '¿Qué juega?')}</SectionLabel>
          <View style={styles.chips}>
            {DEPORTES.map((d) => (
              <Chip key={d.value} label={d.label} emoji={d.emoji} selected={form.deporte === d.value} onPress={() => set('deporte', form.deporte === d.value ? null : d.value)} />
            ))}
          </View>
          {divisiones.length ? (
            <View style={styles.chips}>
              {divisiones.map((d) => (
                <Chip key={d} small label={d} selected={form.division === d} onPress={() => set('division', form.division === d ? '' : d)} />
              ))}
            </View>
          ) : null}

          <ColegioField label={su('¿A qué colegio vas o fuiste?', '¿A qué colegio va?')} value={form.colegio} onChange={(v) => set('colegio', v)} />
          <DomicilioField label={"Domicilio"} value={form.domicilio} onChange={(v) => set('domicilio', v)} onLocalidad={(v) => set('localidad', v)} />
          <LocalidadField label={su('¿En qué localidad vivís?', '¿En qué localidad viven?')} value={form.localidad} onChange={(v) => set('localidad', v)} />
          <TextField label={su('Teléfono', 'Tu teléfono (mamá, papá o tutor/a)')} optional value={form.telefono} onChangeText={(v) => set('telefono', maskPhone(v))} error={errors.telefono} keyboardType="phone-pad" placeholder="+54 9 11 5555-5555" />
          <TextField label={su('¿Tenés familia en el club?', '¿Tiene hermanos en el club?')} optional value={form.familiaEnClub} onChangeText={(v) => set('familiaEnClub', v)} placeholder="Ej: hermano Tomás en M-12" />

          <SectionLabel>{su('¿Estás contento/a en el club?', '¿Está contento/a en el club?')}</SectionLabel>
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
          <View style={styles.chips}>
            <Chip label="Sí" selected={form.conoceQuienDejo === true} onPress={() => set('conoceQuienDejo', form.conoceQuienDejo === true ? null : true)} />
            <Chip label="No" selected={form.conoceQuienDejo === false} onPress={() => set('conoceQuienDejo', form.conoceQuienDejo === false ? null : false)} />
          </View>
          {form.conoceQuienDejo ? (
            <TextField
              label="¿Quién y por qué?"
              value={form.quienDejoDetalle}
              onChangeText={(v) => set('quienDejoDetalle', v)}
              multiline
              style={{ minHeight: 90, paddingTop: 12, textAlignVertical: 'top' }}
            />
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
  footer: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E4EAF1', gap: 6 },
  saved: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.success, textAlign: 'center' },
});
