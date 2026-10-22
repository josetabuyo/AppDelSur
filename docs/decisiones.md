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
