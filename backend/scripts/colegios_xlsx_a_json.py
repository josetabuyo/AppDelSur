"""Genera data/colegios.json desde el Padrón Oficial de Establecimientos Educativos (xlsx).
Fuente: https://www.argentina.gob.ar/educacion/evaluacion-informacion-educativa/padron-oficial-de-establecimientos-educativos
Toma los colegios de educación común con primario o secundario de CABA y la Provincia de Buenos Aires.
Uso: python3 scripts/colegios_xlsx_a_json.py <padron.xlsx> data/colegios.json   (necesita openpyxl)"""
import json
import sys

import openpyxl

PEQUEÑAS = [" De ", " Del ", " La ", " Los ", " Las ", " Y "]
# El padrón trae los partidos en mayúsculas y sin tildes.
TILDES = {"Echeverria": "Echeverría", "Jose C. Paz": "José C. Paz", "Moron": "Morón", "Ituzaingo": "Ituzaingó", "Lanus": "Lanús"}


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
    out = {}
    for r in rows:
        if not r or not r[ix["Nombre"]] or not r[ix["Común"]] or not any(r[i] for i in niveles):
            continue
        j = r[ix["Jurisdicción"]]
        if j not in ("Buenos Aires", "Ciudad de Buenos Aires"):
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
