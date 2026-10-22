import { Image } from 'expo-image';
import React from 'react';

const escudo = require('../../assets/escudo.png');

/** Escudo del club (relación 423x512). */
export function Crest({ size = 64 }: { size?: number }) {
  return (
    <Image
      source={escudo}
      style={{ width: Math.round(size * (423 / 512)), height: size }}
      contentFit="contain"
      accessibilityLabel="Escudo de Del Sur"
    />
  );
}
