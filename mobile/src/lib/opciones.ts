import type { Deporte } from './forms';

export const DEPORTES: { value: Deporte; label: string; emoji: string }[] = [
  { value: 'rugby', label: 'Rugby', emoji: '🏉' },
  { value: 'hockey', label: 'Hockey', emoji: '🏑' },
  { value: 'rugby_inclusivo', label: 'Rugby inclusivo', emoji: '🤝' },
];

// Los nombres que usa el padrón del club ("Rugby > M-16", "Hockey > 6ta (2do Año)").
export const DIVISIONES: Record<Deporte, string[]> = {
  rugby: ['Escuelita', 'M-9', 'M-10', 'M-11', 'M-12', 'M-13', 'M-14', 'M-15', 'M-16', 'M-17', 'M-18', 'M-19', 'Plantel Superior'],
  hockey: ['Escuelita', '10ma', '9na', '8va', '7ma', '6ta', '5ta', 'Plantel Superior', 'Mamis'],
  rugby_inclusivo: ['Infantiles', 'Adultos'],
};

export const CARITAS = ['😞', '🙁', '😐', '🙂', '😍'];
