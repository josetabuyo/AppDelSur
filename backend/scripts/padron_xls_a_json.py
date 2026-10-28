"""Convierte el export "Socios" de la app del club (.xls) en el JSON que carga importar-padron.ts.

Solo saca los campos que usa la app (nada de pagos, tarjetas ni datos médicos). El .xls y el .json
tienen datos personales: dejalos FUERA del repo (es público).

    python3 scripts/padron_xls_a_json.py ~/Downloads/Socios_281026.xls /tmp/padron.json
"""
import datetime
import json
import sys

import xlrd  # pip install xlrd

CAMPOS = {
    "Nº Socio": "socio", "Apellido": "apellido", "Nombres": "nombre", "Categoría": "categoria",
    "Nº Documento": "dni", "Correo Electrónico": "email", "Fecha de Nacimiento": "fechaNacimiento",
    "Actividades": "actividades", "Divisiones": "divisiones", "Titular de Grupo Familiar": "titularGrupo",
}


def main(src, dst):
    book = xlrd.open_workbook(src)
    s = book.sheet_by_index(0)
    hdr = next(r for r in range(min(20, s.nrows)) if "Nº Socio" in [str(v).strip() for v in s.row_values(r)])
    cols = {str(v).strip(): i for i, v in enumerate(s.row_values(hdr))}
    faltan = [c for c in CAMPOS if c not in cols]
    if faltan:
        sys.exit(f"Faltan columnas: {faltan}")
    out = []
    for r in range(hdr + 1, s.nrows):
        fila = {}
        for col, key in CAMPOS.items():
            v = s.cell_value(r, cols[col])
            if key == "fechaNacimiento" and isinstance(v, float) and v > 0:
                v = datetime.datetime(*xlrd.xldate_as_tuple(v, book.datemode)).date().isoformat()
            v = str(v).strip()
            fila[key] = None if v in ("", "-") else v
        if fila["socio"] and fila["nombre"] and fila["apellido"]:
            if fila["fechaNacimiento"] and not fila["fechaNacimiento"][:4].isdigit():
                fila["fechaNacimiento"] = None
            out.append(fila)
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    con_mail = sum(1 for f in out if f["email"])
    print(f"{len(out)} socios ({con_mail} con mail) → {dst}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
