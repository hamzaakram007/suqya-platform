#!/usr/bin/env bash
# Create a Play upload keystore + gitignored key.properties for a Flutter app.
# Does NOT commit secrets. Does NOT upload to Play.
#
# Usage:
#   ./scripts/android-create-upload-keystore.sh <customer|driver> [output-dir]
#
# Default output-dir: $HOME/suqya-keys (outside the repo).
# Then copies key.properties into apps/<app>/android/ (gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-}"
OUT_DIR="${2:-$HOME/suqya-keys}"

usage() {
  echo "Usage: $0 <customer|driver> [output-dir]" >&2
  exit 1
}

[[ "$APP" == "customer" || "$APP" == "driver" ]] || usage

case "$APP" in
  customer) PACKAGE="sa.suqya.customer" ;;
  driver) PACKAGE="sa.suqya.driver" ;;
esac

ANDROID_DIR="$ROOT/apps/${APP}-app/android"
if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "Missing $ANDROID_DIR — merge Flutter native scaffolds first." >&2
  exit 1
fi

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found (install a JDK)." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR" || true

STORE_FILE="$OUT_DIR/suqya-${APP}-upload.jks"
PROPS_OUT="$OUT_DIR/suqya-${APP}-key.properties"
PROPS_APP="$ANDROID_DIR/key.properties"

if [[ -f "$STORE_FILE" ]]; then
  echo "Refusing to overwrite existing keystore: $STORE_FILE" >&2
  echo "Back it up offline; Play rejects a changed upload key without Play App Signing reset." >&2
  exit 1
fi

echo "==> Creating upload keystore for $PACKAGE"
echo "    Store: $STORE_FILE"
echo "    Passwords are prompted interactively (not echoed / not committed)."

keytool -genkey -v \
  -keystore "$STORE_FILE" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias upload \
  -dname "CN=Suqya ${APP}, OU=Mobile, O=Suqya, L=Riyadh, ST=Riyadh, C=SA"

umask 077
# Prefer absolute store path so Gradle finds it regardless of CWD.
PROPS_BODY=$(cat <<EOF
storePassword=REPLACE_STORE_PASSWORD
keyPassword=REPLACE_KEY_PASSWORD
keyAlias=upload
storeFile=$STORE_FILE
EOF
)
printf '%s\n' "$PROPS_BODY" > "$PROPS_OUT"
printf '%s\n' "$PROPS_BODY" > "$PROPS_APP"

chmod 600 "$STORE_FILE" "$PROPS_OUT" "$PROPS_APP" || true

cat <<EOF

Done (local only — nothing committed).

1. Edit passwords in:
   - $PROPS_APP
   - $PROPS_OUT (backup copy outside repo)
2. Rebuild AAB:
   cp apps/${APP}-app/dart_defines.staging.example.json apps/${APP}-app/dart_defines.staging.json
   # fill real API_URL / TENANT_ID, then:
   ./scripts/flutter-build-release.sh ${APP} android staging
3. Upload AAB to Play Console → Internal testing
   (or Fastlane supply with a Play service-account JSON outside git).

NEVER commit *.jks / key.properties / Play JSON keys.
Back up $STORE_FILE offline — losing it blocks updates if you are not on Play App Signing.
EOF
