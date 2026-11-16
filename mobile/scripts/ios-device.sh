#!/usr/bin/env bash
# Compila e instala "Del Sur" en el iPhone de José con su Apple ID gratis (Personal Team), sin EAS ni
# cuenta paga. Basado en ~/Development/las-mobile/scripts/ios-device.sh (LasMobile ya lo probó en esta Mac:
# Xcode 26, CocoaPods, iPhone pareado por cable o Wi-Fi).
#
#   npm run ios:device            # demo: API de producción + login con usuarios de prueba (como el APK demo)
#   npm run ios:device -- real    # login con Google de verdad
#
# Release, con el JS adentro: anda sin la Mac. La firma gratis dura 7 días: volvé a correrlo para reinstalar.
# Bundle propio (com.josetabuyo.appdelsur) para no gastar ar.org.delsur.app, que queda para la cuenta paga.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "✖ $*" >&2; exit 1; }

XV=$(xcodebuild -version 2>/dev/null | awk '/^Xcode/{print $2}')
[ -n "$XV" ] || fail "Xcode no está instalado (App Store → Xcode)."
[ "${XV%%.*}" -ge 26 ] || fail "Xcode $XV es viejo para Expo SDK 58 / RN 0.88: instalá Xcode 26 y corré sudo xcode-select -s /Applications/Xcode.app"
command -v pod >/dev/null || fail "Falta CocoaPods: brew install cocoapods"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && nvm use --silent 22 >/dev/null
node -e "process.exit(Number(process.versions.node.split('.')[0]) < 22 ? 1 : 0)" || fail "Hace falta Node 22+ (nvm install 22)"

MODE=${1:-demo}
case "$MODE" in
  demo) export EXPO_PUBLIC_DEV_LOGIN=1 ;;
  real) export EXPO_PUBLIC_DEV_LOGIN=0 ;;
  *) fail "Modo desconocido: $MODE (demo | real)" ;;
esac
export EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL:-https://appdelsur.vercel.app}

TEAM=${DELSUR_TEAM:-HH948A433A} # Personal Team de José (Xcode › Settings › Accounts)
BUNDLE=${DELSUR_BUNDLE:-com.josetabuyo.appdelsur}
DEVICE=${DELSUR_DEVICE:-$(xcrun devicectl list devices 2>/dev/null | awk '/iPhone/ && (/ connected / || /available \(paired\)/){print $3; exit}')}
[ -n "$DEVICE" ] || fail "No veo ningún iPhone (cable o misma Wi-Fi, desbloqueado). O pasá DELSUR_DEVICE=<id>."

[ -d ios ] || { echo "· Generando el proyecto iOS (primera vez)…"; npx expo prebuild --platform ios --no-install; (cd ios && pod install); }
WS=$(ls -d ios/*.xcworkspace | head -1); SCHEME=$(basename "$WS" .xcworkspace)

echo "· Compilando $SCHEME ($MODE, $BUNDLE, API $EXPO_PUBLIC_API_URL)…"
(cd ios && xcodebuild -workspace "$SCHEME.xcworkspace" -scheme "$SCHEME" -configuration Release \
  -destination "generic/platform=iOS" -derivedDataPath build/dd -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" CODE_SIGN_STYLE=Automatic PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE" build -quiet)
APP=$(ls -d ios/build/dd/Build/Products/Release-iphoneos/*.app | head -1)
echo "· Instalando en el iPhone…"
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" --terminate-existing "$BUNDLE" || echo "  (desbloqueá el iPhone y abrí Del Sur)"
echo "✔ Del Sur instalada en el iPhone ($MODE). Si iOS no la deja abrir: Ajustes › General › VPN y gestión de dispositivos › confiar."
