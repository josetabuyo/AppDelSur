# Ficha de Google Play — Del Sur

Todo lo que pide Play Console para publicar, listo para copiar. Gráficos en esta carpeta
(`icono-512.png`, `destacada-1024x500.png`, `capturas/`); se regeneran con `python3 docs/play-store/make_graphics.py`.

## Datos de la app

| Campo | Valor |
|---|---|
| Nombre (máx. 30) | `Del Sur · Rugby y Hockey` |
| Paquete | `ar.org.delsur.app` |
| Categoría | Deportes |
| Gratis / paga | Gratis, sin compras ni anuncios |
| Mail de contacto | `delsurclubadm@gmail.com` |
| Sitio web | `https://appdelsur.vercel.app` |
| Política de privacidad | `https://appdelsur.vercel.app/privacidad` |
| Borrar cuenta (URL) | `https://appdelsur.vercel.app/borrar-cuenta` |

## Descripción corta (máx. 80)

> La app de Del Sur Rugby Club: sumate y cargá los datos de tu familia en 2 min.

## Descripción completa (máx. 4000)

> **Más conectados. Más organizados. Más Del Sur.**
>
> Esta es la app de Del Sur Rugby Club (rugby, hockey y rugby inclusivo), de Esteban Echeverría. La hizo el club, para el club, sin ningún otro interés que el club.
>
> **¿Para qué sirve?**
> Del Sur crece y queremos hacerlo bien. Con la app cada jugador, jugadora, familia, socio, ex jugador y amigo del club se suma en dos minutos y nos cuenta lo básico: quiénes somos, dónde vivimos, a qué colegio van los chicos. Con eso el club puede organizarse mejor, comunicarse y tomar decisiones.
>
> **Cómo funciona**
> • Entrás con tu cuenta de Google.
> • Elegís: juego, cargo los datos de mi hijo/a, o soy parte de la comunidad.
> • Completás un cuestionario corto: solo nombre y apellido son obligatorios.
> • Listo. Podés volver a cargar otro hijo/a cuando quieras.
>
> **Tus datos**
> Se usan solo para la organización del club. No los vendemos ni los compartimos, y no hay publicidad. Podés borrar tu cuenta y todo lo que cargaste desde la misma app.
>
> Esto recién empieza: después vienen más cosas para la vida de club. Gracias por sumarte. 💙🤍💛

## Capturas (teléfono, 1080×1920)

1. `capturas/1-bienvenida.png` — Viví el club
2. `capturas/2-bienvenida-club.png` — Juegan todos (rugby inclusivo)
3. `capturas/3-login.png` — Sumate a la vida de club
4. `capturas/4-sos-jugador.png` — ¿Sos jugador/a?
5. `capturas/5-cuestionario.png` — Contanos de vos

## Formularios de "Contenido de la app"

**Acceso a la app** — La app requiere iniciar sesión. Instrucción para el revisor: *"Tocá SUMATE e iniciá sesión con cualquier cuenta de Google; no hace falta invitación ni credenciales especiales."*
⚠️ Para que esto sea cierto, la pantalla de consentimiento OAuth del proyecto de Google Cloud tiene que estar **publicada (En producción)**, no en "Prueba"; en "Prueba" solo entran los usuarios de prueba cargados a mano.

**Anuncios** — No contiene anuncios.

**Público objetivo** — **18 años o más.** Los menores no usan la app: un adulto responsable carga sus datos ("Cargo los datos de mi hijo/a"). No marcar edades menores: eso activa la política de Familias.

**Clasificación de contenido (IARC)** — Categoría "Referencia, noticias o educación / otra"; sin violencia, sexo, lenguaje, drogas, apuestas. Sí: los usuarios no interactúan entre sí; no comparte ubicación; no hay compras.

**Seguridad de los datos**

| Pregunta | Respuesta |
|---|---|
| ¿Recopila o comparte datos? | Recopila: sí. Comparte con terceros: **no**. |
| ¿Cifrado en tránsito? | Sí (HTTPS). |
| ¿Se puede pedir el borrado? | Sí — en la app y en `/borrar-cuenta`. |
| Información personal | Nombre, mail, ID de usuario (cuenta de Google), domicilio/localidad, teléfono, otra info (DNI, fecha de nacimiento, colegio, división, familia en el club). |
| Otra | Respuestas a la encuesta del club (¿estás contento?, ¿conocés a alguien que dejó?). |
| Uso de todos los datos | **Funcionalidad de la app** y **Administración de la cuenta**. Recopilación obligatoria para nombre/mail/ID; el resto es opcional. |
| Ubicación precisa, fotos, contactos, salud, finanzas | No. |

**Apps gubernamentales / financieras / salud / COVID** — No aplica.

## Firma y actualización desde el APK

El build `production` (AAB) se firma con el **mismo keystore de EAS** que el APK que circula por WhatsApp. En Play Console, al activar *Play App Signing*, elegir **"Usar la clave de firma de mi app" / exportar y subir clave existente** (PEPK) con ese keystore (`npx eas-cli credentials` → Android → Download keystore). Así quien instaló el APK actualiza desde Play sin desinstalar. Si se deja que Google genere una clave nueva, esos teléfonos tienen que desinstalar el APK primero.

## Pasos en Play Console (cuando esté la cuenta)

1. Crear app → nombre, idioma **español (Latinoamérica)**, app, gratis.
2. Completar "Contenido de la app" (arriba) y la ficha (textos + gráficos).
3. Prueba → **Prueba cerrada** → subir el `.aab` (o `npx eas-cli submit -p android --profile production`, que necesita una cuenta de servicio de Google Cloud con acceso a Play).
4. Cargar **12+ testers** (mails de Gmail, o un Grupo de Google) y mandarles el link de opt-in. Contar **14 días seguidos** con ellos instalados.
5. Pedir acceso a producción → revisión → publicar.
