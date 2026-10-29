"""Genera data/colegios.json desde el Padrón Oficial de Establecimientos Educativos (xlsx).
Fuente: https://www.argentina.gob.ar/educacion/evaluacion-informacion-educativa/padron-oficial-de-establecimientos-educativos
Toma los colegios de educación común con primario o secundario de CABA y de las localidades de la
Provincia a menos de 20 km de Capital (centro de la localidad según Georef, datos abiertos).
Uso: python3 scripts/colegios_xlsx_a_json.py <padron.xlsx> data/colegios.json   (necesita openpyxl)"""
import json
import math
import sys
import unicodedata
import urllib.request

import openpyxl

# CABA (General Paz, Riachuelo y la costa), aproximado: alcanza para medir distancias de varios km.
CABA = [(-34.535, -58.462), (-34.555, -58.495), (-34.583, -58.514), (-34.604, -58.531), (-34.636, -58.529),
        (-34.660, -58.509), (-34.682, -58.488), (-34.700, -58.462), (-34.690, -58.430), (-34.668, -58.405),
        (-34.655, -58.385), (-34.640, -58.360), (-34.630, -58.350), (-34.600, -58.355), (-34.580, -58.380),
        (-34.560, -58.420), (-34.540, -58.455)]
KM_DE_CAPITAL = 20
GEOREF = "https://apis.datos.gob.ar/georef/api"


def clave(s):
    return " ".join(unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().upper().replace(".", " ").split())


def km_a_capital(lat, lon):
    """0 si está adentro; si no, distancia en km al borde (proyección plana, sobra a esta escala)."""
    kx, ky = 111.32 * math.cos(math.radians(-34.6)), 110.57
    p = (lon * kx, lat * ky)
    pts = [(b * kx, a * ky) for a, b in CABA]
    adentro, d = False, float("inf")
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        if (y1 > p[1]) != (y2 > p[1]) and p[0] < (x2 - x1) * (p[1] - y1) / (y2 - y1) + x1:
            adentro = not adentro
        dx, dy = x2 - x1, y2 - y1
        t = max(0, min(1, ((p[0] - x1) * dx + (p[1] - y1) * dy) / (dx * dx + dy * dy)))
        d = min(d, math.hypot(p[0] - x1 - t * dx, p[1] - y1 - t * dy))
    return 0 if adentro else d


def centroides():
    """Centro de cada localidad y de cada partido de la Provincia (Georef), por nombre normalizado."""
    def get(recurso, campos):
        with urllib.request.urlopen(f"{GEOREF}/{recurso}?provincia=06&max=5000&campos={campos}") as r:
            return json.load(r)[recurso]
    loc = {(clave(x["nombre"]), clave(x["departamento"]["nombre"])): x["centroide"] for x in get("localidades", "nombre,departamento.nombre,centroide")}
    dep = {clave(x["nombre"]): x["centroide"] for x in get("departamentos", "nombre,centroide")}
    return loc, dep


PEQUEÑAS = [" De ", " Del ", " La ", " Los ", " Las ", " Y "]
# El padrón trae los partidos en mayúsculas y sin tildes.
TILDES = {"Echeverria": "Echeverría", "Jose C. Paz": "José C. Paz", "Moron": "Morón", "Ituzaingo": "Ituzaingó", "Lanus": "Lanús", "San Martin": "San Martín", "Lopez": "López", "Guillon": "Guillón", "Jose Maria": "José María"}


def titulo(s):
    s = str(s).title()
    for w in PEQUEÑAS:
        s = s.replace(w, w.lower())
    for sin, con in TILDES.items():
        s = s.replace(sin, con)
    return s


def main(entrada, salida):
    rows = openpyxl.load_workbook(entrada, read_only=True).worksheets[0].iter_rows(values_only=True)
    for h in rows:
        if h and "Jurisdicción" in h:
            break
    h = [str(c) if c is not None else "" for c in h]
    ix = {k: h.index(k) for k in ["Jurisdicción", "Departamento", "Localidad", "Nombre", "Común"]}
    niveles = [i for i, c in enumerate(h) if c.startswith("Primario") or c.startswith("Secundario")]
    loc, dep = centroides()
    out = {}
    for r in rows:
        if not r or not r[ix["Nombre"]] or not r[ix["Común"]] or not any(r[i] for i in niveles):
            continue
        j = r[ix["Jurisdicción"]]
        if j == "Buenos Aires":
            c = loc.get((clave(r[ix["Localidad"]]), clave(r[ix["Departamento"]]))) or dep.get(clave(r[ix["Departamento"]]))
            if not c or km_a_capital(c["lat"], c["lon"]) > KM_DE_CAPITAL:
                continue
        elif j != "Ciudad de Buenos Aires":
            continue
        nombre = " ".join(str(r[ix["Nombre"]]).split())
        lugar = f"CABA · {r[ix['Departamento']]}" if j == "Ciudad de Buenos Aires" else f"{titulo(r[ix['Localidad']])} · {titulo(r[ix['Departamento']])}"
        out[(nombre, lugar)] = {"n": nombre, "l": lugar}
    datos = sorted(out.values(), key=lambda x: (x["n"], x["l"]))
    with open(salida, "w") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(datos)} colegios → {salida}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
