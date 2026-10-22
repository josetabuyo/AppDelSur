#!/usr/bin/env bash
# Exporta la app Expo para web y la copia a public/ para que el backend la sirva en "/".
# Uso: API_URL=https://appdelsur.vercel.app scripts/build-web.sh
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mktemp -d)"
(cd "$here/../mobile" && EXPO_PUBLIC_API_URL="${API_URL:?falta API_URL}" npx expo export --platform web --output-dir "$out" >/dev/null)
rm -rf "$here/public/_expo" "$here/public/assets"
# Vercel nunca sube carpetas node_modules: las fuentes de Expo van a assets/nm (next.config reescribe la URL)
[ -d "$out/assets/node_modules" ] && mv "$out/assets/node_modules" "$out/assets/nm"
cp -R "$out"/. "$here/public/"
echo "web exportada a public/ (API $API_URL)"
