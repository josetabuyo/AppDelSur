# Ficha de App Store — Del Sur

Lo que pide App Store Connect, listo para copiar. Textos largos: los mismos de `docs/play-store/ficha.md`.
Capturas iPhone 6,9" (1320×2868) en `capturas/`; se regeneran con
`uv run --with pillow python docs/app-store/make_capturas.py` (salen de las de Play).

## Datos de la app

| Campo | Valor |
|---|---|
| Nombre (máx. 30) | `Del Sur · Rugby y Hockey` |
| Subtítulo (máx. 30) | `La app del club, del club` |
| Bundle ID | `ar.org.delsur.app` |
| SKU | `appdelsur` |
| Categoría | Deportes (secundaria: Estilo de vida) |
| Precio | Gratis, sin compras ni anuncios |
| URL de soporte | `https://appdelsur.vercel.app` |
| URL de privacidad | `https://appdelsur.vercel.app/privacidad` |
| Copyright | `2026 José Miguel Tabuyo` |
| Palabras clave (máx. 100) | `rugby,hockey,club,del sur,esteban echeverria,rugby inclusivo,socios,padron,familia,urba` |
| Texto promocional (170) | `Del Sur crece: sumate en dos minutos y cargá tus datos o los de tus hijos. Hecha por el club, para el club.` |

## Iniciar sesión (guía 4.8)

Apple exige **Iniciar sesión con Apple** si la app ofrece Google: está (botón "Continuar con Apple" en el iPhone,
`POST /api/v1/auth/apple` valida el token de Apple). Necesita la capacidad *Sign in with Apple* en el App ID
`ar.org.delsur.app` — EAS la activa sola al compilar (`usesAppleSignIn` en `app.json`).

**Notas para el revisor:** *"Sign in with Google or Apple; any account works, no invitation needed. After signing in,
choose who you are loading data for and fill in the short club questionnaire. Account deletion: Mi cuenta → Borrar cuenta."*

## Privacidad de la app ("etiqueta nutricional")

- Rastreo (tracking): **No**.
- Datos vinculados al usuario, uso **Funcionalidad de la app**, sin publicidad:
  - Información de contacto: nombre, mail, teléfono, dirección física.
  - Identificadores: ID de usuario.
  - Otros datos: DNI, fecha de nacimiento, colegio, división, familia en el club, respuestas a la encuesta.
- No: ubicación, salud, finanzas, contactos, fotos, historial, diagnóstico.

## Clasificación por edad

Todo "Ninguno" / "No" → **4+**. Sin contenido generado por usuarios visible a otros, sin web abierta, sin compras.

## Exportación / cifrado

`ITSAppUsesNonExemptEncryption = false` ya está en `app.json` (solo HTTPS): no pide documentación.

## Pasos (cuando Apple apruebe la cuenta)

1. `eas build -p ios --profile production` (EAS crea certificados, App ID y perfil con la cuenta paga).
2. `eas submit -p ios` → crea/usa la app en App Store Connect y la sube a **TestFlight**.
3. TestFlight interno: José y quien sumemos (hasta 100, sin revisión). Externo: hasta 10.000, revisión corta.
4. Ficha + capturas + privacidad → **Enviar a revisión** (suele tardar 1–2 días).
