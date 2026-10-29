/** Buscador en memoria para listas cortas (colegios, localidades): "n" = nombre, "l" = lugar. */
export type Item = { n: string; l: string };
export type Opcion = { nombre: string; lugar: string };

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[°º]/g, " ");
const palabrasDe = (s: string) => norm(s).split(/[^a-z0-9ñ]+/).filter(Boolean);

// Primero el partido del club (Esteban Echeverría), después los de alrededor, después el resto.
const PARTIDO = /esteban echeverria$/;
const CERCA = /ezeiza$|la matanza$|lomas de zamora$|caba$|caba · comuna (4|7|8|9|10)$/;
const cercania = (lugar: string) => (PARTIDO.test(lugar) ? 2 : CERCA.test(lugar) ? 1 : 0);

/** Cada palabra buscada tiene que ser el comienzo de una palabra del nombre o del lugar ("5" no trae "85"). */
export function buscador(items: Item[]) {
  const indice = items.map((c) => ({ c, palabras: palabrasDe(`${c.n} ${c.l}`), cerca: cercania(norm(c.l)) }));
  return (q: string, max = 12): Opcion[] => {
    const buscadas = palabrasDe(q);
    if (!buscadas.length || buscadas.join("").length < 2) return [];
    const hits = indice.filter((x) => buscadas.every((p) => x.palabras.some((w) => w.startsWith(p))));
    hits.sort((a, b) => b.cerca - a.cerca || a.c.n.length - b.c.n.length || a.c.n.localeCompare(b.c.n));
    return hits.slice(0, max).map(({ c }) => ({ nombre: c.n, lugar: c.l }));
  };
}
