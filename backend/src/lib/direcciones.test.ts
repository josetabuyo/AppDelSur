import { describe, expect, it } from "vitest";
import { aDireccion, aSugerencias, direccionesDisponible } from "./direcciones";

describe("direcciones (Google Places)", () => {
  it("sin clave no está disponible", () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    expect(direccionesDisponible()).toBe(false);
  });

  it("arma las sugerencias del autocompletado", () => {
    const r = { suggestions: [{ placePrediction: { placeId: "p1", structuredFormat: { mainText: { text: "Camino de Cintura 9399" }, secondaryText: { text: "9 de Abril, Provincia de Buenos Aires" } } } }, {}] };
    expect(aSugerencias(r)).toEqual([{ id: "p1", nombre: "Camino de Cintura 9399", lugar: "9 de Abril, Provincia de Buenos Aires" }]);
  });

  it("normaliza calle, localidad y partido (en CABA el barrio)", () => {
    const pba = aDireccion({
      formattedAddress: "Camino de Cintura 9399, B1839 9 de Abril, Provincia de Buenos Aires, Argentina",
      addressComponents: [
        { longText: "9399", types: ["street_number"] },
        { longText: "Camino de Cintura", types: ["route"] },
        { longText: "9 de Abril", types: ["locality", "political"] },
        { longText: "Esteban Echeverría", types: ["administrative_area_level_2", "political"] },
        { longText: "Provincia de Buenos Aires", types: ["administrative_area_level_1", "political"] },
      ],
    });
    expect(pba).toMatchObject({ domicilio: "Camino de Cintura 9399", localidad: "9 de Abril", partido: "Esteban Echeverría" });
    const caba = aDireccion({
      addressComponents: [
        { longText: "Av. Roca", types: ["route"] },
        { longText: "6000", types: ["street_number"] },
        { longText: "Villa Lugano", types: ["sublocality_level_1", "sublocality"] },
        { longText: "Buenos Aires", types: ["locality"] },
      ],
    });
    expect(caba).toMatchObject({ domicilio: "Av. Roca 6000", localidad: "Villa Lugano" });
  });
});
