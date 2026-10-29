/**
 * Domicilios normalizados con Google Places (API "New"). Solo anda si está GOOGLE_MAPS_API_KEY;
 * sin la clave la app usa el campo de texto libre y la lista de localidades.
 * Costo: autocompletado + un detalle por sesión (sessionToken), dentro del cupo gratis mensual de Google.
 */
const BASE = "https://places.googleapis.com/v1";
// Cerca del club (Camino de Cintura 9399, 9 de Abril) aparecen primero.
const CLUB = { latitude: -34.7585, longitude: -58.4875 };

export const direccionesDisponible = () => !!process.env.GOOGLE_MAPS_API_KEY;

export type Sugerencia = { id: string; nombre: string; lugar: string };
export type Direccion = { domicilio: string; localidad: string | null; partido: string | null; provincia: string | null; completa: string };

type Prediccion = { placePrediction?: { placeId: string; text?: { text: string }; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } } } };
type Componente = { longText: string; types: string[] };

export function aSugerencias(r: { suggestions?: Prediccion[] }): Sugerencia[] {
  return (r.suggestions ?? []).flatMap(({ placePrediction: p }) =>
    p ? [{ id: p.placeId, nombre: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "", lugar: p.structuredFormat?.secondaryText?.text ?? "" }] : [],
  );
}

export function aDireccion(r: { formattedAddress?: string; addressComponents?: Componente[] }): Direccion {
  const c = (t: string) => r.addressComponents?.find((x) => x.types.includes(t))?.longText ?? null;
  const calle = [c("route"), c("street_number")].filter(Boolean).join(" ");
  return {
    domicilio: calle || r.formattedAddress || "",
    // En CABA el barrio viene como sublocality; en provincia, la localidad.
    localidad: c("sublocality_level_1") ?? c("locality"),
    partido: c("administrative_area_level_2"),
    provincia: c("administrative_area_level_1"),
    completa: r.formattedAddress ?? calle,
  };
}

const headers = (extra: Record<string, string> = {}) => ({ "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY ?? "", ...extra });

export async function autocompletar(input: string, sessionToken: string): Promise<Sugerencia[]> {
  const res = await fetch(`${BASE}/places:autocomplete`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      input,
      sessionToken,
      languageCode: "es",
      includedRegionCodes: ["ar"],
      locationBias: { circle: { center: CLUB, radius: 40000 } },
    }),
  });
  if (!res.ok) throw new Error(`places ${res.status}`);
  return aSugerencias(await res.json());
}

export async function detalle(id: string, sessionToken: string): Promise<Direccion> {
  const url = `${BASE}/places/${encodeURIComponent(id)}?languageCode=es&sessionToken=${encodeURIComponent(sessionToken)}`;
  const res = await fetch(url, { headers: headers({ "X-Goog-FieldMask": "formattedAddress,addressComponents" }) });
  if (!res.ok) throw new Error(`places ${res.status}`);
  return aDireccion(await res.json());
}
