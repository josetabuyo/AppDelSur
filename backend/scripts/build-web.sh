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
# iPhone sin App Store: "Agregar a inicio" la instala como app (ícono del escudo, pantalla completa, sin barras de Safari).
sips -z 180 180 "$here/../mobile/assets/icon.png" --out "$here/public/apple-touch-icon.png" >/dev/null
sips -z 512 512 "$here/../mobile/assets/icon.png" --out "$here/public/icon-512.png" >/dev/null
cat > "$here/public/manifest.json" <<'JSON'
{
  "name": "Del Sur · Rugby y Hockey",
  "short_name": "Del Sur",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0C3C6E",
  "theme_color": "#0C3C6E",
  "icons": [
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
JSON
pwa='<link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black"><meta name="apple-mobile-web-app-title" content="Del Sur">'
perl -0pi -e "s#</head>#${pwa}</head>#" "$here/public/index.html"
echo "web exportada a public/ (API $API_URL)"
