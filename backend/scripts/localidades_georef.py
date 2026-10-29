"""Genera data/localidades.json: localidades de la Provincia de Buenos Aires (API Georef del Estado
argentino, datos abiertos) más los 48 barrios de CABA, que Georef no separa.
Uso: python3 scripts/localidades_georef.py data/localidades.json"""
import json
import sys
import urllib.request

URL = "https://apis.datos.gob.ar/georef/api/localidades?provincia=06&max=5000&campos=nombre,departamento.nombre"

BARRIOS_CABA = """Agronomía, Almagro, Balvanera, Barracas, Belgrano, Boedo, Caballito, Chacarita, Coghlan, Colegiales,
Constitución, Flores, Floresta, La Boca, La Paternal, Liniers, Mataderos, Monte Castro, Montserrat, Nueva Pompeya,
Núñez, Palermo, Parque Avellaneda, Parque Chacabuco, Parque Chas, Parque Patricios, Puerto Madero, Recoleta, Retiro,
Saavedra, San Cristóbal, San Nicolás, San Telmo, Vélez Sarsfield, Versalles, Villa Crespo, Villa del Parque,
Villa Devoto, Villa General Mitre, Villa Lugano, Villa Luro, Villa Ortúzar, Villa Pueyrredón, Villa Real,
Villa Riachuelo, Villa Santa Rita, Villa Soldati, Villa Urquiza"""


def main(salida):
    with urllib.request.urlopen(URL) as r:
        pba = json.load(r)["localidades"]
    out = {(x["nombre"], x["departamento"]["nombre"]) for x in pba if x["nombre"] != x["departamento"]["nombre"]}
    out |= {(b.strip(), "CABA") for b in BARRIOS_CABA.split(",")}
    datos = [{"n": n, "l": l} for n, l in sorted(out)]
    with open(salida, "w") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(datos)} localidades → {salida}")


if __name__ == "__main__":
    main(sys.argv[1])
