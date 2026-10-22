# Contrato API v1 — AppDelSur

Fuente de verdad entre `backend/` (Next.js en Vercel) y `mobile/` (Expo). Todo JSON, UTF-8.

## Base URL

- Dev: `http://localhost:9014` (puerto LAS reclamado por AppDelSur). Desde el emulador Android: `http://10.0.2.2:9014`. Desde un teléfono en la misma red: `http://<ip-lan-del-mac>:9014`.
- Prod: `https://appdelsur.vercel.app` (proyecto Vercel `appdelsur`, cuando se despliegue).
- El móvil la toma de `EXPO_PUBLIC_API_URL`.

## Versionado (app vieja + app nueva conviviendo)

- Todas las rutas de datos viven bajo `/api/v1/`. Un cambio incompatible crea `/api/v2/` y **v1 se mantiene** mientras haya apps viejas instaladas.
- El móvil manda `X-App-Version: <semver>` en cada request.
- `GET /api/v1/health` → `200 {"ok":true,"apiVersion":1,"minAppVersion":"0.1.0","latestAppVersion":"0.1.0"}`.
- Si `X-App-Version` < `minAppVersion` → `426 {"error":"actualizar","minAppVersion":"..."}`; la app muestra "Actualizá la app" (con EAS Update casi nunca debería pasar).

## Login desde la app (Google vía el backend)

La app **no** habla con Google directo: el backend (Auth.js v5 + Google) es el emisor de sesión. Así hay un solo cliente OAuth (web) y sirve igual en Expo Go, APK, iOS y web.

1. La app abre `WebBrowser.openAuthSessionAsync(`${API}/mobile/login?redirect=${encodeURIComponent(redirectUri)}`, redirectUri)`.
   `redirectUri` = `Linking.createURL('auth')` → `appdelsur://auth` en build, `exp://…/--/auth` en Expo Go, `http://localhost:8081/auth` en web.
2. `/mobile/login` (página del backend): si ya hay sesión Auth.js → redirige a `/mobile/callback`. Si no, muestra escudo + botón "Entrar con Google" (`signIn("google", { redirectTo: "/mobile/callback?redirect=..." })`). En dev (no Vercel, no production) además un formulario "Entrar de prueba" (nombre + email) con el provider Credentials `dev-login`.
3. `/mobile/callback?redirect=…` (route handler): lee la sesión, hace upsert del usuario, firma un **token de app** (JWT HS256 con `AUTH_SECRET`, `jose`, 180 días, claims `sub`=userId, `email`, `name`) y redirige a `${redirect}?token=<jwt>`.
   - `redirect` se valida contra allowlist de prefijos: `appdelsur://`, `exp://`, `exps://`, `http://localhost`, `http://127.0.0.1`, `http://192.168.` y `http://10.`. Otro → 400.
4. La app guarda el token (expo-secure-store; en web localStorage) y lo manda como `Authorization: Bearer <token>`.

Atajo solo dev (para tests y simulador sin navegador): `POST /api/v1/auth/dev-login {"email","name"}` → `{"token","user"}`. Responde 404 en producción.

## Endpoints

### `GET /api/v1/me` (Bearer)
`200 {"user":{"id","email","name","image"},"registros":[Registro,...]}` — los registros que cargó este usuario (él y/o sus hijos). `401` sin token válido.

### `POST /api/v1/registros` (Bearer)
Crea un registro (una persona). Un padre puede crear varios (uno por hijo).

```jsonc
{
  "tipo": "jugador" | "comunidad",
  "cargaPara": "yo" | "hijo",          // "hijo" = un adulto carga los datos de un menor
  "nombre": "string",                    // requerido
  "apellido": "string",                  // requerido
  // jugador:
  "dni": "string?",                      // solo dígitos, 7-8
  "fechaNacimiento": "YYYY-MM-DD?",
  "deporte": "rugby" | "hockey" | "rugby_inclusivo" | null,
  "division": "string?",                 // ej. "M8", "M15", "Plantel superior", "Pumpas XV"
  "colegio": "string?",                  // DATO CLAVE
  "localidad": "string?",
  "domicilio": "string?",
  "telefono": "string?",
  "email": "string?",
  "familiaEnClub": "string?",            // hermanos/hijos/padres en el club, texto libre
  "contento": 1..5 | null,               // ¿estás contento en el club?
  "conoceQuienDejo": boolean | null,
  "quienDejoDetalle": "string?",         // quién y por qué
  // comunidad:
  "vinculo": "familiar" | "socio" | "ex_jugador" | "amigo" | "otro" | null,
  "vinculoDetalle": "string?",           // ej. "mamá de Juan, M10"
  "comentarios": "string?"
}
```
`201 {"registro":Registro}`; `400 {"error":"validacion","campos":{"nombre":"requerido",...}}` (validación con zod).

`Registro` = el body + `id`, `createdAt`, `appVersion`.

## Modelo de datos (Postgres: Neon en prod, PGlite en dev)

- `users` — id uuid, email único, name, image, google_sub, role (`member`|`admin`, default `member`), created_at.
- `registros` — id uuid, user_id → users (quien cargó), carga_para, tipo, todos los campos de arriba en snake_case, app_version, created_at, updated_at.
  Pensado para v2: un usuario con N registros = grupo familiar; `colegio` texto libre ahora, se normaliza después a tabla `colegios` para el ranking; `division`/`deporte` alimentan asistencia y perfiles.
