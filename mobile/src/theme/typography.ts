import { TextStyle } from 'react-native';

export const fonts = {
  display: 'Anton_400Regular',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_800ExtraBold',
};

// Títulos estilo posteo del club: condensada, mayúsculas, apretada.
export const display = (size: number): TextStyle => ({
  fontFamily: fonts.display,
  fontSize: size,
  lineHeight: Math.round(size * 1.05),
  textTransform: 'uppercase',
  letterSpacing: 0.5,
});

export const body = (size = 16, weight: keyof typeof fonts = 'body'): TextStyle => ({
  fontFamily: fonts[weight],
  fontSize: size,
  lineHeight: Math.round(size * 1.45),
});
