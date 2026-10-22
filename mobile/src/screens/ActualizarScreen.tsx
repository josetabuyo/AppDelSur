import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Crest } from '../components/Crest';
import { SHARE_URL } from '../config';
import { colors, display, fonts } from '../theme';

/** Se muestra si el backend responde 426 (versión de app demasiado vieja para la API). */
export default function ActualizarScreen() {
  return (
    <View style={styles.root}>
      <Crest size={96} />
      <Text style={styles.title}>Actualizá la app</Text>
      <Text style={styles.p}>
        Hay una versión nueva de la app de Del Sur. Bajala desde el link que te pasó tu manager, o tocá el botón.
      </Text>
      <Button label="Bajar la versión nueva" onPress={() => Linking.openURL(SHARE_URL)} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },
  title: { ...display(44), color: colors.white, textAlign: 'center' },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
});
