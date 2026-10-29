# Decisiones técnicas y costos (2026-10-21)

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| App | **Expo SDK 58 (React Native 0.88, React 19.2), TypeScript** | Es lo que ya usamos (Minis App Acces corre SDK 55; subimos a 58 porque Expo Go del App Store/Play solo abre el SDK actual). Una base de código → Android, iOS **y web**. |
| Navegación | react-navigation native-stack | Estándar; el ejemplo lo tenía instalado. |
| Backend | **Next.js 16 en Vercel** (proyecto nuevo `appdelsur`) | Mismo patrón que Pulpo y Luganense. Proyecto propio para no mezclar dominios ni secretos. |
| Login | **Auth.js v5 + Google, el backend emite la sesión** | La app abre `/mobile/login` en el navegador del sistema y vuelve con un token propio (JWT). Un solo cliente OAuth (web) sirve para Expo Go, APK, iOS y web; no hace falta cliente Android/iOS ni SHA-1. |
| Base | **Postgres en Neon** (prod) / PGlite (dev local, sin instalar nada) + Drizzle | Mismo patrón que Pulpo/Luganense; el free tier alcanza para miles de registros. |
| Node | 22 (Expo 58 pide ≥ 22.13) | `.nvmrc` en el repo. |

Alternativas miradas: Flutter (otro lenguaje, perdemos lo reusado), PWA pura (sin presencia de "app" ni push en iOS cómodo), Firebase/Supabase Auth (otra cuenta más; Auth.js ya anda). Expo sigue siendo la opción por defecto de React Native en 2026.

## Distribución y actualización

**Recomendación para la prueba con Quieta (primeros días de noviembre), costo USD 0:**

1. **Link web (PWA)** — el mismo código exportado a web, servido en Vercel. Funciona en cualquier teléfono, sin instalar. Es el plan rojo y también la forma más rápida de que Joel y Lucas lo vean hoy.
2. **Android: APK directo** (EAS Build perfil `preview`) que se pasa por WhatsApp. Se instala una vez; después **EAS Update** empuja los cambios de JS/diseño y todos los teléfonos se actualizan solos al abrir la app.
3. **iOS sin pagar: Expo Go + EAS Update** — los amigos instalan *Expo Go* (gratis, App Store) y abren el link/QR de la rama `preview`. Sirve para feedback, no para la comunidad entera.

**Para la comunidad (cuando el feedback lo valide):**

| Opción | Costo | Comentario |
|---|---|---|
| Android APK + EAS Update | USD 0 | Alcanza para comunidad cerrada; Android avisa "origen desconocido" una vez. |
| Google Play (prueba cerrada → producción) | USD 25 una vez | Instalación limpia desde Play y actualizaciones automáticas. Cuentas personales nuevas requieren 12 testers × 14 días antes de producción: arrancarlo temprano. |
| iOS TestFlight / App Store | USD 99 / año (Apple Developer) | No hay otra forma seria de instalar en iPhone. TestFlight: hasta 10.000 testers por link. |
| EAS (Expo) | Free: 15 builds Android + 15 iOS por mes, Update hasta 1.000 usuarios activos/mes | ~250 personas → entra en el Free. Si se pasa: Starter USD 19/mes (3.000 MAU). |
| Vercel | Hobby USD 0 | Uso no comercial; si el club lo formaliza, Pro USD 20/mes. |
| Neon | Free USD 0 | 0,5 GB; sobra. |

**Total para arrancar: USD 0. Total "en las tiendas": USD 25 una vez + USD 99/año.**

## App vieja + app nueva conviviendo

- La API vive en `/api/v1/`. Cambio incompatible → `/api/v2/`, y v1 sigue viva mientras haya instalaciones viejas.
- La app manda `X-App-Version`; `/api/v1/health` publica `minAppVersion`. Si una app quedó demasiado vieja, el backend responde 426 y la app muestra "Actualizá la app".
- EAS Update con `runtimeVersion: appVersion`: un cambio de JS se publica sin reinstalar. Solo un cambio nativo (nueva librería nativa) exige APK/TestFlight nuevo, y la versión de runtime evita que un update nuevo caiga en un binario viejo.

## Cuentas que vamos a necesitar (nada creado ni pagado todavía)

1. **Google Cloud – cliente OAuth web** (gratis) en la cuenta de José, redirect `https://appdelsur.vercel.app/api/auth/callback/google`. Sin esto el login funciona solo en modo prueba.
2. **Vercel** — proyecto `appdelsur` en el team existente (gratis) + Neon desde el Marketplace (gratis).
3. **Expo/EAS** — la cuenta de José ya existe; hace falta `eas init` para el projectId (gratis).
4. Más adelante: Apple Developer (USD 99/año) y Google Play Console (USD 25).

## Estado al 2026-10-24

**En producción** (`appdelsur.vercel.app`): web, Android (APK + EAS Update, rama `preview`) e iPhone como **PWA** (Safari → Compartir → "Agregar a inicio": ícono del escudo, pantalla completa). Bienvenida = inicio también con sesión ("Entrar"); fotos institucionales de Lucas; tono neutro ("Llegó la nueva app del club", "Más conectados. Más organizados. Más Del Sur.").

**Cómo se actualiza:**
- Cambios de JS/diseño en Android: `npx -y eas-cli@latest update --branch preview --environment preview --platform android --message "…" --non-interactive`. El teléfono lo baja al abrir y lo aplica al siguiente arranque (cerrar y abrir dos veces). `eas update` **no** lee el `env` de `eas.json` (eso es solo para builds): `EXPO_PUBLIC_API_URL` vive en las variables de EAS (entornos `preview` y `production`, creadas 2026-10-26). Sin ella el update sale apuntando a `10.0.2.2` y el login falla en todos los Android (pasó con los updates del 22–23/10).
- Web + iPhone (PWA): José corre `bash backend/scripts/publicar.sh` (el agente no puede desplegar a prod).
- Cambio nativo → APK nuevo (`eas build -p android --profile preview`), actualizar la redirección `/android` y subir `minAppVersion`.

**Tests:** `cd mobile && npx jest` (23) y `cd backend && npm test` (26); `npx tsc --noEmit` limpio.

**Pendientes:**
- José: cuenta Google Play Console (USD 25, pago único) → subir el AAB a prueba cerrada (12 testers × 14 días). Ficha, gráficos y respuestas de formularios listos en `docs/play-store/ficha.md`. Antes: `publicar.sh` para que el backend tenga `DELETE /api/v1/me` y `/borrar-cuenta` (Play exige borrar cuenta), y confirmar que la pantalla de consentimiento OAuth está "En producción".
- Joel: confirmar preguntas del cuestionario. Club: divisiones de Rugby Inclusivo (hoy "Infantiles/Adultos" es placeholder).
- Alguien con iPhone: probar el login de Google en la PWA instalada.
- Pantalla admin con cantidad de registrados (ofrecida, sin arrancar).
- **Video en pausa** hasta terminar la app (reel de 8 placas en `video/`, sin voz; se grabará una voz del club). No se mandó al grupo.
- Después: dominio propio (nic.ar), Apple Developer (USD 99/año), v2 reemplazando la app del tercero.

## MVP cerrado (2026-10-28) — feedback de Quieta del 28/10

**Flujo nuevo, más minimalista** (José: "salió con demasiado humo y color"; Lucas: lo primero es recolectar datos):

1. **Inicio** sin sesión: escudo, una foto, "La app del club", *Entrar con Google*. Nada más.
2. Después del login, según el **padrón de socios** (lista blanca de mails, el export "Socios" que pasó Lucas: 643 socios, 628 con mail, 408 "Jugadores"):
   - **Está en el padrón** → pantalla *Completá tus datos*: lista a la familia que comparte ese mail (los jugadores, incluida la categoría "Familia R.I" = rugby inclusivo), cada uno con su división. Al tocar, el formulario ya viene con nombre, DNI, fecha y división; si el padrón los tiene todos, se saltea el paso "Persona" (2 pasos en vez de 3, con "Editar"). Sin presentación institucional.
   - **No está** → la presentación del club (la "folletería") → *¿Sos jugador/a?* → formularios, como antes.
3. **Sumar a un compañero/a** (José: "lo tenés al lado en el tercer tiempo y lo agregás"): desde el padrón, desde ¿sos jugador? y desde el gracias. Formulario corto, sin "¿estás contento?" (no se responde por otro), con su mail para que después pueda entrar.
4. Gracias → *Listo* vuelve a la lista del padrón con el ✓.

El registro guarda `socio_nro`: cada carga queda atada al socio del padrón (BI: cruzar padrón vs. cargados = quién falta).

**Cargar / actualizar el padrón en producción** (los .xls y .json tienen datos personales: nunca al repo, el `.gitignore` los bloquea):

```bash
cd backend
python3 scripts/padron_xls_a_json.py ~/ruta/Socios_281026.xls /tmp/padron.json   # solo los campos que usa la app
DATABASE_URL='<Neon prod>' npm run padron:importar -- /tmp/padron.json && rm /tmp/padron.json
```

Ojo: el export trae números de tarjeta en "Forma de Pago" y datos médicos: el conversor **no** los lee.

**Tests:** `cd mobile && npx jest` (34) · `cd backend && npm test` (39) · `npx tsc --noEmit` limpio en los dos. Probado de punta a punta en web local con un padrón de prueba.

## Las dos cuentas de desarrollador (lo único que falta para tiendas)

| | Google Play Console | Apple Developer Program |
|---|---|---|
| Costo | USD 25, una vez | USD 99 por año |
| Quién paga | José | Lucas (a nombre de José) |
| Requisito de testers | **Sí**: cuenta personal nueva → prueba cerrada con **12 testers × 14 días seguidos** antes de poder publicar en producción | **No hay**. (Los "12 testers" son de Google, no de Apple.) |
| Revisión | Revisión de Google al pasar a producción | TestFlight interno (hasta 100, sin revisión); externo con link (hasta 10.000) pide una revisión beta corta; App Store, revisión completa |
| Qué hago yo cuando exista | `eas build -p android --profile production` (AAB) + `eas submit` a prueba cerrada; ficha lista en `docs/play-store/ficha.md` | `eas build -p ios` (EAS firma, no hace falta Xcode) + `eas submit` a TestFlight; después ficha de App Store (capturas iPhone, privacidad) |

- A nombre de persona, la tienda muestra "José Tabuyo" como vendedor. Si más adelante el club quiere figurar como organización: cuenta de organización (necesita D-U-N-S del club como asociación civil, gratis pero tarda). En Google, la cuenta de organización además **no** tiene la regla de 12 testers. Apple tiene exención de la cuota para organizaciones sin fines de lucro solo en algunos países; hay que chequear si Argentina entra.
- Mientras corren los 14 días de Play: el APK directo + EAS Update y la PWA en iPhone siguen funcionando igual.

**Orden para dar el OK final:**
1. José: `bash backend/scripts/publicar.sh` (despliega backend + web; la migración `0001_padron` corre sola en el build).
2. José (o yo con la URL de Neon): cargar el padrón (comando de arriba).
3. Yo: `eas update` a la rama `preview` → los Android que ya la tienen se actualizan solos.
4. José paga Play → yo rehago las capturas de `docs/play-store/capturas/` (son del flujo viejo) y subo el AAB a prueba cerrada → juntamos 12 testers (Quieta + amigos) y arrancan los 14 días.
5. Lucas paga Apple → invitación a la cuenta → yo hago el build iOS y TestFlight.

## Colegio, localidad, domicilio y teléfono normalizados (2026-10-28)

Pedido del grupo: que los datos se puedan contar sin limpiar a mano.

- **Colegio**: se elige de los 11.041 colegios primarios y secundarios de CABA y Provincia del Padrón
  Oficial de Establecimientos Educativos (Ministerio de Capital Humano, 2025, CC BY 4.0), primero los de
  Esteban Echeverría y alrededores. "Otro" deja escribir uno que no está; el cruce de esos se hace aparte.
  `backend/data/colegios.json`, se regenera con `scripts/colegios_xlsx_a_json.py`. API: `GET /api/v1/colegios?q=`.
- **Localidad**: localidades de la Provincia (API Georef, datos abiertos) + los 48 barrios de CABA, con "Otro".
  `backend/data/localidades.json` (`scripts/localidades_georef.py`). API: `GET /api/v1/localidades?q=`.
- **Teléfono**: solo números, se arma solo como `+54 9 11 5555-6666`.
- **Domicilio con Google Maps** (lo que espera Joel): ya está programado, se prende con la clave.
  Georef (gratis) no sirve para direcciones: ubica el club en Tres de Febrero. Sin clave, el domicilio es
  texto libre. Con clave, el usuario elige una dirección real y la localidad se completa sola.
  API: `GET /api/v1/direcciones?q=&session=` y `GET /api/v1/direcciones/:id?session=` (con sesión de la app).

### Prender Google Maps (lo hace José, pide tarjeta)

1. https://console.cloud.google.com → el proyecto de Google de José (o uno nuevo "appdelsur").
2. Facturación → vincular una cuenta de facturación (tarjeta). Poner una alerta de presupuesto (ej. USD 5).
3. APIs y servicios → Biblioteca → habilitar **Places API (New)**.
4. Credenciales → Crear clave de API → restringirla a "Places API (New)".
5. `cd backend && vercel env add GOOGLE_MAPS_API_KEY production` (pegar la clave) y `bash scripts/publicar.sh`.

Costo: Google da un cupo gratis mensual por SKU; el autocompletado usa sesión (varias teclas + un
detalle cuentan como una búsqueda). Con ~650 socios cargando una vez queda dentro de lo gratis.
