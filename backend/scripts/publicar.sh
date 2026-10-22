#!/usr/bin/env bash
# Publica AppDelSur en Vercel (proyecto "appdelsur", ya linkeado, con Neon conectado).
# 1ra vez: carga las variables de producción (reusa el cliente OAuth de Google de Luganense).
# Después: exporta la app web, despliega a producción (el build corre las migraciones en Neon).
# Uso, desde la raíz del repo:  bash backend/scripts/publicar.sh
set -euo pipefail
cd "$(dirname "$0")/.."
# vercel está instalado global en otro Node: lo resolvemos antes de cambiar a Node 22
VERCEL="$(command -v vercel || ls ~/.nvm/versions/node/*/bin/vercel | head -1)"
vercel() { "$VERCEL" "$@"; }
source ~/.nvm/nvm.sh >/dev/null && nvm use 22 >/dev/null

existing="$(vercel env ls production 2>/dev/null || true)"
set_env() { # nombre valor — solo si no existe
  if grep -qE "^\s+$1\s" <<<"$existing"; then echo "· $1 ya estaba"; return; fi
  printf '%s' "$2" | vercel env add "$1" production >/dev/null && echo "✓ $1"
}
from_luganense() { grep -h "^$1=" ../../Luganense/.env.local | head -1 | cut -d= -f2- | sed 's/^"//; s/"$//'; }

set_env AUTH_SECRET "$(openssl rand -base64 33)"
set_env AUTH_GOOGLE_ID "$(from_luganense AUTH_GOOGLE_ID)"
set_env AUTH_GOOGLE_SECRET "$(from_luganense AUTH_GOOGLE_SECRET)"
set_env MIN_APP_VERSION 0.1.0
set_env LATEST_APP_VERSION 0.1.0

API_URL="${API_URL:-https://appdelsur.vercel.app}" scripts/build-web.sh
vercel deploy --prod --yes
