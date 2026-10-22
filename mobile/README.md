# Del Sur — app móvil (Expo)

App de la comunidad de **Del Sur Rugby Club**: bienvenida → login con Google → ¿sos jugador/a? →
cuestionario (3 pasos) o enrolamiento (comunidad) → gracias. Android + iOS + web con el mismo código.

- Expo SDK 58 · React Native 0.88 · React 19 · TypeScript strict · react-navigation (native stack)
- Habla con el backend según `../docs/contrato-api.md` (`/api/v1/*`, header `X-App-Version`, 426 → "Actualizá la app").
- Capturas del flujo: `../docs/capturas/`.

```
src/
  config.ts          API base (EXPO_PUBLIC_API_URL), versión, flags
  navigation/        stack + tipos de rutas
  screens/           Bienvenida, Login, SosJugador, Cuestionario, Enrolamiento, Gracias, Actualizar
  components/        Button, Chip, TextField, StepProgress, FormHeader, FormScaffold, Crest, Stripes
  services/          api.ts (fetch + versionado), auth.ts (login vía navegador), storage.ts (token)
  state/session.tsx  sesión: token, /me, login/logout, aviso de actualización
  lib/               validación (DNI, fecha DD/MM/AAAA), formularios, payload del contrato
  theme/             colores del club y tipografía (Anton + Inter)
assets/              escudo, íconos, splash y fotos del collage (generados por scripts/make_assets.py)
```

## Requisitos

```bash
source ~/.nvm/nvm.sh && nvm use 22
cd mobile && npm install
```

El backend (`../backend`) corre en `http://localhost:9014`. Para que lo vea un teléfono tiene que escuchar
en toda la red (Next: `next dev -H 0.0.0.0 -p 9014`).

## Correr

### Web (lo más rápido)

```bash
npm run dev:web        # = EXPO_PUBLIC_DEV_LOGIN=1 expo start --web --port 8082 (puerto reclamado en LAS)
```

Abrí http://localhost:8082. Con `EXPO_PUBLIC_DEV_LOGIN=1` aparece **"Entrar de prueba"** (llama a
`POST /api/v1/auth/dev-login`, no necesita Google).

### Expo Go en el teléfono (misma Wi-Fi que la Mac)

```bash
EXPO_PUBLIC_DEV_LOGIN=1 npx expo start
```

Escaneá el QR con la cámara (iPhone) o con Expo Go (Android). La app deduce sola la IP de la Mac
(`hostUri` de Expo) y apunta a `http://<ip-de-la-mac>:9014`. Si no, forzala:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.23:9014 EXPO_PUBLIC_DEV_LOGIN=1 npx expo start
```

(La IP sale de `ipconfig getifaddr en0`.) El login con Google vuelve a la app vía `exp://…/--/auth`.

### Emulador Android / simulador iOS

```bash
npx expo start   # y apretá "a" (Android) o "i" (iOS)
```

Android emulator usa `http://10.0.2.2:9014`; el simulador de iOS, `http://localhost:9014`.

## Tests y chequeos

```bash
npm test                               # jest-expo + Testing Library
npx tsc --noEmit                       # tipos
npx expo export --platform web         # prueba que el bundle compila (sale en dist/)
npx expo export --platform android
```

## Variables

| Variable | Para qué | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | base del backend | IP de la Mac en dev nativo, `10.0.2.2` en emulador Android, `localhost:9014` en web |
| `EXPO_PUBLIC_DEV_LOGIN` | `1` muestra "Entrar de prueba" | apagado |
| `EXPO_PUBLIC_SHARE_URL` | link que se comparte por WhatsApp | `https://appdelsur.vercel.app` |

## Assets

`npm run assets` (= `python3 scripts/make_assets.py`, necesita Pillow) regenera desde `../referencias/`:
escudo limpio (fondo transparente), ícono, ícono adaptativo Android (+ monocromo), splash, favicon y los
recortes de fotos del Instagram del club para el collage.

## Build e instalación (más adelante, con cuenta de Expo)

Todavía **no** hay proyecto EAS (sin `projectId`). Cuando José lo decida:

```bash
npx eas-cli login
npx eas-cli init                         # agrega extra.eas.projectId a app.json
npx eas-cli build -p android --profile preview    # APK para pasar por WhatsApp
npx eas-cli update --channel preview -m "..."      # OTA: actualiza el JS sin reinstalar
```

`eas.json` ya tiene los perfiles `development`, `preview` (APK, canal `preview`) y `production`
(canal `production`), y `app.json` usa `runtimeVersion: { policy: "appVersion" }`: mientras la versión
nativa sea la misma (0.1.0), EAS Update llega a todos; si cambia algo nativo, se sube la versión y se
reparte un APK nuevo. Las apps viejas siguen andando porque el backend mantiene `/api/v1` y responde
426 sólo si la versión es menor a `minAppVersion`.

iOS: TestFlight necesita Apple Developer (USD 99/año). Mientras tanto, iPhone puede usar Expo Go o la web.
