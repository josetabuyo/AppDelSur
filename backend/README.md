# AppDelSur backend

Next.js 16 (App Router) + Auth.js v5 + Drizzle + zod + jose. Implementa `../docs/contrato-api.md` (API v1).

## Correr en local

```bash
source ~/.nvm/nvm.sh && nvm use 22
npm install
npm run dev          # http://localhost:9014  (puerto LAS reclamado)
npm test             # vitest
npm run build
npm run smoke        # con el server dev andando en 9014 (usa dev-login, que no existe en production)
```

DB local: sin `DATABASE_URL` (o sin `neon.tech`) se usa PGlite en `.data/pglite`, con migraciones aplicadas al arrancar.
`npm run db:migrate` las aplica a mano (también sobre Neon si `DATABASE_URL` apunta a neon.tech).
Cambios de esquema: editar `src/db/schema.ts` y `npx drizzle-kit generate`.

## Variables de entorno (`.env.example`)

| Variable | Uso |
|---|---|
| `AUTH_SECRET` | Firma sesión Auth.js y tokens de app (HS256, 180 días) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Cliente OAuth web de Google (si faltan, no hay botón Google) |
| `DATABASE_URL` | Neon en prod; vacío en dev => PGlite |
| `MIN_APP_VERSION` | Debajo de esta, `/api/v1/*` responde 426 |
| `LATEST_APP_VERSION` | Informativo en `/health` |

`.env.local` (gitignored) ya trae un `AUTH_SECRET` aleatorio de dev.

## Rutas

`/` landing, `/mobile/login?redirect=`, `/mobile/callback?redirect=` (allowlist), `/api/auth/*` (Auth.js),
`GET /api/v1/health`, `POST /api/v1/auth/dev-login` (404 en prod/Vercel), `GET /api/v1/me`, `POST /api/v1/registros`.
CORS abierto (`*`) en `/api/v1/*` (auth por Bearer, sin cookies); `src/proxy.ts` resuelve OPTIONS y el chequeo `X-App-Version` (sin header no bloquea).

## Deploy a Vercel (más adelante, requiere OK de José)

1. Proyecto nuevo `appdelsur` en el team de José, root directory `backend/`.
2. Neon vía Vercel Marketplace (setea `DATABASE_URL`); correr `npm run db:migrate` una vez con esa URL.
3. Google Cloud: cliente OAuth **Web**, redirect URI `https://appdelsur.vercel.app/api/auth/callback/google`; cargar `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
4. `AUTH_SECRET` (`openssl rand -base64 32`), `MIN_APP_VERSION`, `LATEST_APP_VERSION`.
5. En Vercel el dev-login queda deshabilitado automáticamente.
