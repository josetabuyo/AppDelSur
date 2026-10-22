# AppDelSur — brief de arranque para el agente

Sos **AppDelSur**, las-agent de esta carpeta (`.las-agent.json`, voz Mónica, español).
Al arrancar cada sesión: `/las-agent` primero. Después trabajá como buen **/dev-agent**
(tests, implementación con validación, iterar hasta que pase todo) y como buen
**/orquestador** (dividí el trabajo en subagentes por dominio, escalá modelo ante fallos
consecutivos). El dueño es José; el agente coordinador del vault es **Monkey**
(`las agent send --to Monkey ...`) — él solo indexa, **vos** sos el que especializa y hace.

## /goal

Ser lo más autónomo posible y entregarle a José una **app Android + iOS** instalable, con:

1. **Home / bienvenida** — que enamore del club (imagen collage de fotos de las redes, colores
   del club, rugby inclusivo bien presente, UX moderna y llamativa, buen diseño).
2. **Mensaje de invitación** + **login** (cuenta de Google).
3. **Pregunta: ¿sos jugador?**
   - **No** → *enrolamiento*: lo sumamos a la comunidad (familiar, socio, ex jugador, amigo del club) con sus datos básicos.
   - **Sí** → **cuestionario** (datos abajo).
4. **Cierre / saludo** — el propósito de esto, agradecimiento y el camino que sigue (ver "Propósito").
5. Un **video explicativo corto, estilo motion** (José: "de esos de Opus 5.5") que cuente qué es la app y para qué. No bloquea el MVP; evaluá herramienta (Remotion, Figma `export_video`, lo que tengas a mano) y hacelo cuando el flujo principal esté andando.

Time box acordado en la charla: **una semana**. Primera versión para que los amigos (grupo de WhatsApp **Quieta**: José, Joel, Lucas) la instalen y den feedback en los **primeros días de noviembre 2026**. La siguiente "estación obligatoria de cooperación" es ese feedback.

## El club

- **Del Sur Rugby Club** (rugby y hockey). Camino de Cintura 9399, 9 de Abril, Esteban Echeverría, Buenos Aires — zona Ciudad Evita / Ezeiza / Lugano / Villa Riachuelo, al sur de CABA, fuera de ella. También usan el **Parque Indoamericano**.
- Instagram oficial **@delsurclub** (5.7k seguidores): "Cuenta oficial Del Sur Rugby y Hockey · SOMOS FAMILIA 💙🤍💛 · Súmate a Del Sur". Hay un Google Form en la bio (`forms.gle/41uG7Vp4XfJ3UBMP7`) — probablemente el "formulario" que hoy pide el club.
- Facebook: "Rugby Inclusivo - Del Sur Rugby Club" (~5k likes). Equipo de rugby inclusivo **Pumpas XV** (campeón International Mixed Ability Rugby 2017, Vitoria-Gasteiz). El rugby inclusivo es parte importante de la identidad: tiene que estar en la bienvenida.
- URBA: club invitado. 2025: invicto en Segunda (26/26), ascendió a Primera C. (ESPN)
- Sitio `delsurclub.com` **expiró** (redirige a expireddomains). No contar con él.
- **Estética** (capturas en `referencias/`): escudo = escudo celeste con estrella/cruz amarilla, borde azul marino, banda "DEL SUR". Paleta aproximada: celeste `#2AA7DF`, azul marino `#0C3C6E`, amarillo `#F2D94E`, blanco. Posteos con tipografía display condensada en mayúsculas sobre foto ("SUMATE A LA VIDA DE CLUB", "SÚMATE A ESTA FAMILIA"). Para la imagen de bienvenida: usar/adaptar una foto real de las redes (collage); si hace falta retocar, retocar poco.
- Tamaño: ~200 jugadores, ~50 infantiles, la mitad menores de 18 (muchos chicos de 7-8 años sin teléfono: contesta el padre/madre por ellos — contemplar "cargo datos de mi hijo/a"). La comunicación real del club pasa por grupos de WhatsApp (padres por un lado, jugadores por otro); los **managers** de cada división son el canal de distribución.

## Propósito (lo que hay que transmitir en el cierre)

Es **la app del club, hecha por el club, para el club, sin otro interés que el club** (espíritu open source: "si existe Linux, tiene que existir una app del Sur"). El club hoy no tiene app propia: usa una de un tercero que cobra por mes (carnet digital, QR de acceso, cuenta corriente, mailing) y ni siquiera tiene domicilio actualizado. Hoy el club **no sabe bien cuántos son, quiénes están activos, quiénes pagan, a qué colegio van**. Con esos datos van a poder tomar decisiones: publicidad, contratar un profe, llamar a los que dejaron de venir, regalar una cuota, reclutar en colegios. Gracias por sumarte; esto recién empieza; después viene más (perfiles, asistencia, etc.). Los que empezamos el camino queremos que vengan otros mejores a seguirlo.

## MVP (bala trazadora / walking skeleton, decidido en la charla)

- App de celular (**Android e iPhone desde el día cero**).
- **Login** → ya tenemos usuarios, listos para roles y permisos después (ninguno en el MVP, a lo sumo un admin).
- **Formulario** con los datos pedidos → guardar → "muchas gracias".
- Base de datos **en la nube** (costo mensual aceptado si es chico; "lo más económico y eficiente que se pueda").
- Opcional, solo si sale gratis: botón de **micrófono** → el usuario habla sus datos → un modelito ordena el texto desnormalizado en campos. Si cuesta, afuera.
- **No** quemar a la comunidad: pocos pasos, que no canse. Joel: "no tiene que ser complicado". Lucas: "los datos básicos, no todos los del mundo".

### Datos del cuestionario (ambición de hoy de Joel)

Nombre, apellido, DNI, fecha de nacimiento, dónde vive (domicilio/localidad), **colegio** (es el dato clave: quieren ranking de colegios para reclutar), teléfono, mail, categoría/división, grupo familiar (hijos, hermanos en el club), ¿estás contento en el club?, ¿conocés a alguien que dejó de jugar o de venir? ¿por qué? Para no jugador: nombre, vínculo con el club (familiar de X / socio / ex jugador / amigo), contacto.

Joel armó un form rápido en **Tally** ("Hola familias", fecha infantiles) que compartió en el grupo Quieta: usarlo como referencia de campos y tono. En Quieta también compartió una captura con los **campos que exporta la app actual del club** y hay un `Contexto del Sur.md` con info del club. **Traerlos con `/wavi`** (grupo "Quieta", mensajes del 2026-10-21; leer con la CLI, sesión default, `--newest`).

## Horizonte (versión 2 en adelante, NO ahora)

Perfiles: directores, entrenadores (ven a sus pibes, toman lista, equipos, lesionados), managers (PDF de planilla para imprimir), jugadores. Asistencia y alertas (faltó 3 seguidas, <50%, sin colegio, documentación). Ranking de colegios. Mapa de clubes rivales. Perfil del jugador (tacleador, rápido, etc.) → estrategia a nivel club (población, altura, nutricionista). Absorber la app del tercero (carnet, QR, cuenta corriente, pagos y avisos de pago). Web de administración. Todo lo que la app recolecte alimenta el **data mining / BI** de Joel. Diseñar la base de datos pensando en esto, sin construirlo.

## Decisiones técnicas y lo que tenés que evaluar

- **Stack**: **React Native + Expo** (es lo que ya usamos y está productivo/semi en el ejemplo local). Antes de fijarlo, hacé una pasada corta por la tendencia 2026 (Expo SDK actual, alternativas) y dejá una nota con costos; pero la ventaja de reusar el ejemplo pesa mucho. Prioridad: económico, pero buena velocidad y calidad para el usuario final.
- **Ejemplo de app ya hecha** (las-agent "Minis App Acces", apagado, carpeta legible): `~/Development/Ctrol_Acc_Mv2026/mobile` — Expo 55 / RN 0.83 / React 19, react-navigation native-stack, `eas.json` con build `apk`, `app.json` con íconos adaptativos. Copiá estructura (`src/screens`, `src/navigation`, `src/services`, `src/theme`), no el contenido.
- **Backend + login con Google: en Vercel**, reusando lo que ya anda en **Pulpo** (`~/Development/pulpo/_/web/auth.ts`: Auth.js v5 + Google provider, `session: jwt`, `trustHost`, bypass fake-login solo en dev; proyecto Vercel `pulpo`, Neon Postgres + Drizzle) y **Luganense** (`~/Development/Luganense/auth.ts`, mismo patrón; proyecto Vercel `luganense`). Mismo team de Vercel (`team_CIB8EiQakNePHgDe504O5md3`). Seguimos con la **cuenta de Google de José** para el OAuth (él es socio del club); después se mueve a la cuenta que convenga. Decidí si va como proyecto Vercel nuevo (recomendado: `appdelsur`) o dentro de uno existente, y resolvé el flujo OAuth desde app nativa (Expo AuthSession / expo-auth-session con el backend de Next como emisor de sesión) — Pulpo y Luganense son web, acá el cliente es móvil.
- **Distribución y actualización** (preocupación grande de José): comunidad cerrada y de confianza, así que un método alternativo a las tiendas es aceptable. Evaluá y proponé con costos: (a) Android APK directo por WhatsApp vía managers + **EAS Update** (OTA de JS sin reinstalar — ideal: "lo actualizamos y se actualiza a todos"), (b) Google Play internal testing / closed track, (c) iOS: **TestFlight** (necesita Apple Developer, USD 99/año) vs. alternativas; (d) una **PWA** como plan rojo si iOS traba. Documentá el problema "app vieja + app nueva conviviendo" y cómo lo cubre el backend (versionado de API).
- **Cuentas que pueden hacer falta**: Expo/EAS (José tiene `projectId` en el ejemplo), Google Cloud (OAuth client Android/iOS/web), Apple Developer, Google Play Console (USD 25 una vez). Antes de crear o pagar cualquiera, decile a José exactamente qué y por qué.
- Ports: `las ports audit` / `las ports free` / `las ports claim` antes de levantar cualquier servidor.

## Carpeta

- `transcripciones/` — transcripciones **crudas** (Whisper large-v3-turbo, MLX) de los audios de la charla del 2026-10-21. De 7 archivos, 6 eran el mismo audio duplicado: quedaron 2 (largo 59 min + corto 11 min). **No se comparten crudas**: en una etapa posterior se depuran y lo útil pasa a `docs/` como data del proyecto. Hay tramos con alucinaciones de Whisper (repeticiones "¿Qué pasa?", "pilots", "Lo", "¿No?") — ignorarlos.
- `referencias/` — capturas del Instagram del club (escudo y perfil).
- `.venv-tx/` — venv solo para transcribir (ignorado por git). `transcripciones/transcribir.py` transcribe otro audio si llega.
- Espejo en el vault Monkey: `~/Development/Monkey/projects/appdelsur/appdelsur.md` (**fuente: este repo**; el vault solo resume estado).

## Personas

- **José** (dueño, dev; "el mono"): lidera técnico. Decide stack, cuentas, deploy.
- **Joel**: está en el día a día del club, hace estudios comerciales con datos; dueño del "qué datos" y del uso posterior (BI). Hizo el Tally y el bosquejo HTML con Claude.
- **Lucas**: mirada de usuario / socio del club; recuerda no abrumar al usuario ni testear sobre la comunidad.
- Un informático del club (mencionado como posible continuador) — sinergia futura, no ahora.

## Cómo reportar

Cerrá cada turno con `las speak` en español. Cuando tengas algo instalable, decile a José cómo probarlo en simulador y en su teléfono, y qué link pasar al grupo Quieta.
