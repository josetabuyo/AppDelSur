#!/usr/bin/env bash
# Cambia el cliente OAuth de Google de producción por el del proyecto propio "Del Sur" y re-publica.
# Toma el JSON que descarga Google Cloud (client_secret_*.json, el más nuevo de ~/Downloads, o el que se pase).
# Uso: bash backend/scripts/cambiar-google.sh [ruta/al/client_secret.json]
set -euo pipefail
cd "$(dirname "$0")/.."
VERCEL="$(command -v vercel || ls ~/.nvm/versions/node/*/bin/vercel | head -1)"
vercel() { "$VERCEL" "$@"; }
json="${1:-$(ls -t ~/Downloads/client_secret_*.json | head -1)}"
read_json() { python3 -I -c 'import json,sys; d=json.load(open(sys.argv[1])); print((d.get("web") or d.get("installed"))[sys.argv[2]])' "$json" "$1"; }
id="$(read_json client_id)"; secret="$(read_json client_secret)"
echo "cliente: ${id%%-*}-… (de $json)"
for name in AUTH_GOOGLE_ID AUTH_GOOGLE_SECRET; do vercel env rm "$name" production -y >/dev/null 2>&1 || true; done
printf '%s' "$id" | vercel env add AUTH_GOOGLE_ID production >/dev/null && echo "✓ AUTH_GOOGLE_ID"
printf '%s' "$secret" | vercel env add AUTH_GOOGLE_SECRET production >/dev/null && echo "✓ AUTH_GOOGLE_SECRET"
bash scripts/publicar.sh
