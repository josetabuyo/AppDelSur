import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../services/api';
import { useSession } from '../state/session';
import { colors, fonts, radius } from '../theme';

/** "Entraste como … · Salir" y "Borrar mi cuenta" (Play exige poder borrarla desde la app). */
export function CuentaFooter() {
  const { user, registros, logout, borrarCuenta } = useSession();
  const [borrar, setBorrar] = useState<'cerrado' | 'confirmar' | 'borrando'>('cerrado');
  const [borrarError, setBorrarError] = useState<string | null>(null);

  return (
    <>
        <Pressable onPress={logout} style={styles.logout} accessibilityRole="button">
          <Text style={styles.logoutText}>
            {user?.email ? `Entraste como ${user.email} · ` : ''}
            <Text style={{ textDecorationLine: 'underline' }}>Salir</Text>
          </Text>
        </Pressable>
        {borrar === 'cerrado' ? (
          <Pressable testID="borrar-cuenta" onPress={() => setBorrar('confirmar')} style={styles.borrarLink} accessibilityRole="button">
            <Text style={styles.borrarLinkText}>Borrar mi cuenta</Text>
          </Pressable>
        ) : (
          <View style={styles.borrarBox}>
            <Text style={styles.borrarTitle}>¿Borrar tu cuenta?</Text>
            <Text style={styles.borrarText}>
              Se borran tu cuenta y todo lo que cargaste{registros.length > 0 ? ', también los datos de tus hijos/as' : ''}. No se puede deshacer.
            </Text>
            {borrarError ? <Text style={styles.borrarErr}>{borrarError}</Text> : null}
            <View style={styles.borrarRow}>
              <Pressable
                testID="borrar-cancelar"
                onPress={() => {
                  setBorrar('cerrado');
                  setBorrarError(null);
                }}
                disabled={borrar === 'borrando'}
                style={[styles.borrarBtn, styles.borrarBtnCancel]}
                accessibilityRole="button"
              >
                <Text style={styles.borrarBtnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                testID="borrar-confirmar"
                onPress={async () => {
                  setBorrar('borrando');
                  setBorrarError(null);
                  try {
                    await borrarCuenta();
                  } catch (e) {
                    setBorrarError(e instanceof ApiError && e.status === 0 ? e.message : 'No pudimos borrar la cuenta. Probá de nuevo.');
                    setBorrar('confirmar');
                  }
                }}
                disabled={borrar === 'borrando'}
                style={[styles.borrarBtn, styles.borrarBtnDanger]}
                accessibilityRole="button"
              >
                <Text style={styles.borrarBtnDangerText}>{borrar === 'borrando' ? 'Borrando…' : 'Sí, borrar'}</Text>
              </Pressable>
            </View>
          </View>
        )}
    </>
  );
}

const styles = StyleSheet.create({
  logout: { alignItems: 'center', marginTop: 10, padding: 8 },
  logoutText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  borrarLink: { alignItems: 'center', padding: 6 },
  borrarLinkText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, textDecorationLine: 'underline' },
  borrarBox: { backgroundColor: '#FDECEC', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: '#F5C2C2', gap: 6 },
  borrarTitle: { fontFamily: fonts.black, fontSize: 15, color: '#9B1C1C' },
  borrarText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.text },
  borrarErr: { fontFamily: fonts.semibold, fontSize: 13, color: '#9B1C1C' },
  borrarRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  borrarBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 11, alignItems: 'center' },
  borrarBtnCancel: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E7EDF3' },
  borrarBtnCancelText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  borrarBtnDanger: { backgroundColor: '#B42318' },
  borrarBtnDangerText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
});
