import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useSession } from '../state/session';
import { AutocompleteField } from './AutocompleteField';
import { TextField } from './TextField';

type Props = { label: string; value: string; onChange: (v: string) => void; onLocalidad: (v: string) => void };

/**
 * Domicilio normalizado con Google Maps (vía el backend): al elegir una dirección real también completa
 * la localidad. Si el backend no tiene la clave de Google, queda como texto libre.
 */
export function DomicilioField({ label, value, onChange, onLocalidad }: Props) {
  const { token } = useSession();
  const [google, setGoogle] = useState(false);
  // Google cobra por sesión: autocompletado + un detalle con el mismo token.
  const session = useMemo(() => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`, []);

  useEffect(() => {
    if (!token) return;
    api
      .direcciones(token, '', session)
      .then((r) => setGoogle(r.disponible))
      .catch(() => setGoogle(false));
  }, [token, session]);

  if (!google || !token) {
    return <TextField label={label} optional value={value} onChangeText={onChange} placeholder="Calle y número" />;
  }
  return (
    <AutocompleteField
      testID="domicilio"
      optional
      label={label}
      value={value}
      onChange={onChange}
      buscar={async (q) => (await api.direcciones(token, q, session)).sugerencias.map((s) => ({ key: s.id, titulo: s.nombre, detalle: s.lugar }))}
      elegir={async (o) => {
        onChange(o.titulo);
        try {
          const { direccion: d } = await api.direccion(token, o.key, session);
          onChange(d.domicilio);
          if (d.localidad) onLocalidad(d.partido && d.partido !== d.localidad ? `${d.localidad} (${d.partido})` : d.localidad);
        } catch {
          // queda lo elegido como texto
        }
      }}
      hint="Empezá a escribir la calle y elegí tu dirección."
      hintOtro="Escribí calle y número."
      placeholder="Ej: Camino de Cintura 9399"
      placeholderOtro="Calle y número"
    />
  );
}
